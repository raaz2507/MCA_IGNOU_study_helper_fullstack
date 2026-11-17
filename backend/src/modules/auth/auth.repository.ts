import { createHash, randomUUID } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import { db } from "../../config/db.js";
import { users, sessions, appSettings } from "../../infrastructure/database/schema.js";

export const hashToken = (token: string) =>
	createHash("sha256").update(token).digest("hex");

function toDate(val: string | null | undefined): Date | null {
	if (!val) return null;
	return new Date(val);
}

function mapUser(u: typeof users.$inferSelect | undefined) {
	if (!u) return null;
	return {
		...u,
		emailVerifiedAt: toDate(u.emailVerifiedAt),
		emailVerificationExpiresAt: toDate(u.emailVerificationExpiresAt),
		createdAt: new Date(u.createdAt),
		updatedAt: new Date(u.updatedAt)
	};
}

export type DbUser = NonNullable<ReturnType<typeof mapUser>>;

export const authRepository = {
	async setting<T>(key: string): Promise<T | null> {
		const rows = await db.select().from(appSettings).where(eq(appSettings.key, key));
		if (!rows[0]) return null;
		const val = rows[0].value;
		return (typeof val === "string" ? JSON.parse(val) : val) as T | null;
	},
	async findUserByUsername(username: string): Promise<DbUser | null> {
		const rows = await db.select().from(users).where(eq(users.username, username));
		return mapUser(rows[0]);
	},
	async findUserById(id: string): Promise<DbUser | null> {
		const rows = await db.select().from(users).where(eq(users.id, id));
		return mapUser(rows[0]);
	},
	async findUserByEmail(email: string): Promise<DbUser | null> {
		const rows = await db.select().from(users).where(eq(users.email, email));
		return mapUser(rows[0]);
	},
	async findUserByVerificationTokenHash(emailVerificationTokenHash: string): Promise<DbUser | null> {
		const rows = await db.select().from(users).where(eq(users.emailVerificationTokenHash, emailVerificationTokenHash));
		return mapUser(rows[0]);
	},
	async createUser(data: {
		displayName: string;
		username: string;
		email: string;
		passwordHash: string;
		status: "PENDING" | "ACTIVE";
		emailVerificationRequired?: boolean;
	}): Promise<DbUser> {
		const id = randomUUID();
		const now = new Date().toISOString();
		await db.insert(users).values({
			id,
			displayName: data.displayName,
			username: data.username,
			email: data.email,
			passwordHash: data.passwordHash,
			status: data.status,
			emailVerificationRequired: data.emailVerificationRequired ?? false,
			createdAt: now,
			updatedAt: now
		});
		const user = await this.findUserById(id);
		if (!user) throw new Error("Failed to create user");
		return user;
	},
	async updateProfile(id: string, data: {
		displayName: string;
		email: string;
		emailVerifiedAt?: Date | null;
		emailVerificationRequired?: boolean;
		emailVerificationTokenHash?: string | null;
		emailVerificationExpiresAt?: Date | null;
	}): Promise<DbUser> {
		const updateValues: Record<string, any> = {
			displayName: data.displayName,
			email: data.email,
			updatedAt: new Date().toISOString()
		};
		if (data.emailVerifiedAt !== undefined) {
			updateValues.emailVerifiedAt = data.emailVerifiedAt ? data.emailVerifiedAt.toISOString() : null;
		}
		if (data.emailVerificationRequired !== undefined) {
			updateValues.emailVerificationRequired = data.emailVerificationRequired;
		}
		if (data.emailVerificationTokenHash !== undefined) {
			updateValues.emailVerificationTokenHash = data.emailVerificationTokenHash;
		}
		if (data.emailVerificationExpiresAt !== undefined) {
			updateValues.emailVerificationExpiresAt = data.emailVerificationExpiresAt ? data.emailVerificationExpiresAt.toISOString() : null;
		}
		await db.update(users).set(updateValues).where(eq(users.id, id));
		const user = await this.findUserById(id);
		if (!user) throw new Error("User not found");
		return user;
	},
	async updatePassword(id: string, passwordHash: string): Promise<DbUser> {
		await db.update(users).set({
			passwordHash,
			updatedAt: new Date().toISOString()
		}).where(eq(users.id, id));
		const user = await this.findUserById(id);
		if (!user) throw new Error("User not found");
		return user;
	},
	async setEmailVerificationToken(id: string, tokenHash: string, expiresAt: Date): Promise<DbUser> {
		await db.update(users).set({
			emailVerificationRequired: true,
			emailVerificationTokenHash: tokenHash,
			emailVerificationExpiresAt: expiresAt.toISOString(),
			updatedAt: new Date().toISOString()
		}).where(eq(users.id, id));
		const user = await this.findUserById(id);
		if (!user) throw new Error("User not found");
		return user;
	},
	async markEmailVerified(id: string, verifiedAt: Date): Promise<DbUser> {
		await db.update(users).set({
			emailVerifiedAt: verifiedAt.toISOString(),
			emailVerificationRequired: false,
			emailVerificationTokenHash: null,
			emailVerificationExpiresAt: null,
			updatedAt: new Date().toISOString()
		}).where(eq(users.id, id));
		const user = await this.findUserById(id);
		if (!user) throw new Error("User not found");
		return user;
	},
	async deleteUserSessions(userId: string) {
		return db.delete(sessions).where(eq(sessions.userId, userId));
	},
	async createSession(userId: string, refreshToken: string, expiresAt: Date) {
		const id = randomUUID();
		const now = new Date().toISOString();
		await db.insert(sessions).values({
			id,
			userId,
			tokenHash: hashToken(refreshToken),
			expiresAt: expiresAt.toISOString(),
			createdAt: now
		});
		return {
			id,
			userId,
			tokenHash: hashToken(refreshToken),
			expiresAt,
			createdAt: new Date(now)
		};
	},
	async findSession(refreshToken: string) {
		const tokenHash = hashToken(refreshToken);
		const rows = await db.select({
			session: sessions,
			user: users
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.tokenHash, tokenHash));

		if (!rows[0]) return null;
		const s = rows[0].session;
		const u = mapUser(rows[0].user)!;
		return {
			...s,
			expiresAt: new Date(s.expiresAt),
			createdAt: new Date(s.createdAt),
			user: u
		};
	},
	async deleteSession(refreshToken: string) {
		return db.delete(sessions).where(eq(sessions.tokenHash, hashToken(refreshToken)));
	},
	async deleteExpiredSessions() {
		return db.delete(sessions).where(lt(sessions.expiresAt, new Date().toISOString()));
	}
};
