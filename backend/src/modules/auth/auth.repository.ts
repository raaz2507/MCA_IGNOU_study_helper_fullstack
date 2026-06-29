import { createHash } from "node:crypto";
import { prisma } from "../../config/prisma.js";

export const hashToken = (token: string) =>
	createHash("sha256").update(token).digest("hex");

export const authRepository = {
	async setting<T>(key: string): Promise<T | null> {
		const setting = await prisma.appSetting.findUnique({ where: { key } });
		return setting?.value as T | null;
	},
	findUserByUsername(username: string) {
		return prisma.user.findUnique({ where: { username } });
	},
	findUserById(id: string) {
		return prisma.user.findUnique({ where: { id } });
	},
	findUserByEmail(email: string) {
		return prisma.user.findUnique({ where: { email } });
	},
	findUserByVerificationTokenHash(emailVerificationTokenHash: string) {
		return prisma.user.findUnique({ where: { emailVerificationTokenHash } });
	},
	createUser(data: {
		displayName: string;
		username: string;
		email: string;
		passwordHash: string;
		status: "PENDING" | "ACTIVE";
		emailVerificationRequired?: boolean;
	}) {
		return prisma.user.create({ data });
	},
	updateProfile(id: string, data: {
		displayName: string;
		email: string;
		emailVerifiedAt?: Date | null;
		emailVerificationRequired?: boolean;
		emailVerificationTokenHash?: string | null;
		emailVerificationExpiresAt?: Date | null;
	}) {
		return prisma.user.update({ where: { id }, data });
	},
	updatePassword(id: string, passwordHash: string) {
		return prisma.user.update({ where: { id }, data: { passwordHash } });
	},
	setEmailVerificationToken(id: string, tokenHash: string, expiresAt: Date) {
		return prisma.user.update({
			where: { id },
			data: {
				emailVerificationRequired: true,
				emailVerificationTokenHash: tokenHash,
				emailVerificationExpiresAt: expiresAt
			}
		});
	},
	markEmailVerified(id: string, verifiedAt: Date) {
		return prisma.user.update({
			where: { id },
			data: {
				emailVerifiedAt: verifiedAt,
				emailVerificationRequired: false,
				emailVerificationTokenHash: null,
				emailVerificationExpiresAt: null
			}
		});
	},
	deleteUserSessions(userId: string) {
		return prisma.session.deleteMany({ where: { userId } });
	},
	createSession(userId: string, refreshToken: string, expiresAt: Date) {
		return prisma.session.create({
			data: { userId, tokenHash: hashToken(refreshToken), expiresAt }
		});
	},
	findSession(refreshToken: string) {
		return prisma.session.findUnique({
			where: { tokenHash: hashToken(refreshToken) },
			include: { user: true }
		});
	},
	deleteSession(refreshToken: string) {
		return prisma.session.deleteMany({
			where: { tokenHash: hashToken(refreshToken) }
		});
	},
	deleteExpiredSessions() {
		return prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
	}
};

