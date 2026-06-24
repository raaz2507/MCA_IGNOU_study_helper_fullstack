import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { authRepository } from "./auth.repository.js";

const ACCESS_SECONDS = 15 * 60;
const REFRESH_SECONDS = 7 * 24 * 60 * 60;

export type PublicUser = {
	id: string;
	username: string;
	displayName: string;
	role: string;
};

const publicUser = (user: any): PublicUser => ({
	id: user.id,
	username: user.username,
	displayName: user.displayName,
	role: user.role.toLowerCase()
});

function accessToken(user: any) {
	return jwt.sign(
		{ sub: user.id, username: user.username, displayName: user.displayName, role: user.role },
		env.accessSecret,
		{ expiresIn: ACCESS_SECONDS }
	);
}

function refreshToken(user: any) {
	return jwt.sign({ sub: user.id, type: "refresh" }, env.refreshSecret, {
		expiresIn: REFRESH_SECONDS
	});
}

export const authService = {
	async register(input: {
		displayName: string;
		username: string;
		email: string;
		password: string;
	}) {
		if (await authRepository.findUserByUsername(input.username)) {
			throw new AppError(409, "Username is already in use.", "USERNAME_TAKEN");
		}
		if (await authRepository.findUserByEmail(input.email)) {
			throw new AppError(409, "Email is already registered.", "EMAIL_TAKEN");
		}
		const { prisma } = await import("../../config/prisma.js");
		const setting = await prisma.appSetting.findUnique({ where: { key: "new-user-default-status" } });
		const value = setting?.value as { status?: string } | null;
		const status = value?.status === "ACTIVE" ? "ACTIVE" : "PENDING";
		const user = await authRepository.createUser({
			displayName: input.displayName,
			username: input.username,
			email: input.email,
			passwordHash: await bcrypt.hash(input.password, 12),
			status
		});
		return { user: publicUser(user), status };
	},
	async login(username: string, password: string) {
		const user = await authRepository.findUserByUsername(username);
		if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
			throw new AppError(401, "Invalid username or password.", "INVALID_CREDENTIALS");
		}
		if (user.status !== "ACTIVE") {
			throw new AppError(403, `This account is ${user.status.toLowerCase()}.`, "ACCOUNT_RESTRICTED");
		}
		const refresh = refreshToken(user);
		await authRepository.deleteExpiredSessions();
		await authRepository.createSession(
			user.id,
			refresh,
			new Date(Date.now() + REFRESH_SECONDS * 1000)
		);
		return { user: publicUser(user), accessToken: accessToken(user), refreshToken: refresh };
	},
	async refresh(refresh: string) {
		try {
			jwt.verify(refresh, env.refreshSecret);
		} catch {
			throw new AppError(401, "Refresh token is invalid.", "INVALID_REFRESH_TOKEN");
		}
		const session = await authRepository.findSession(refresh);
		if (!session || session.expiresAt < new Date()) {
			throw new AppError(401, "Session has expired.", "SESSION_EXPIRED");
		}
		if (session.user.status !== "ACTIVE") {
			throw new AppError(403, "This account is restricted.", "ACCOUNT_RESTRICTED");
		}
		return { user: publicUser(session.user), accessToken: accessToken(session.user) };
	},
	async currentUser(userId: string) {
		const user = await authRepository.findUserById(userId);
		if (!user) throw new AppError(401, "User no longer exists.", "USER_NOT_FOUND");
		if (user.status !== "ACTIVE") throw new AppError(403, "This account is restricted.", "ACCOUNT_RESTRICTED");
		return publicUser(user);
	},
	async profile(userId: string) {
		const user = await authRepository.findUserById(userId);
		if (!user) throw new AppError(404, "User not found.", "USER_NOT_FOUND");
		return {
			id: user.id,
			username: user.username,
			displayName: user.displayName,
			email: user.email || "",
			role: user.role.toLowerCase(),
			status: user.status
		};
	},
	async updateProfile(userId: string, input: { displayName: string; email: string }) {
		const existing = await authRepository.findUserByEmail(input.email);
		if (existing && existing.id !== userId) {
			throw new AppError(409, "Email is already registered.", "EMAIL_TAKEN");
		}
		const user = await authRepository.updateProfile(userId, input);
		return {
			id: user.id,
			username: user.username,
			displayName: user.displayName,
			email: user.email || "",
			role: user.role.toLowerCase(),
			status: user.status
		};
	},
	async changePassword(userId: string, currentPassword: string, newPassword: string) {
		const user = await authRepository.findUserById(userId);
		if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
			throw new AppError(400, "Current password is incorrect.", "INVALID_CURRENT_PASSWORD");
		}
		await authRepository.updatePassword(userId, await bcrypt.hash(newPassword, 12));
		await authRepository.deleteUserSessions(userId);
		return { success: true };
	},
	logout(refresh: string | undefined) {
		return refresh ? authRepository.deleteSession(refresh) : Promise.resolve();
	},
	verifyAccess(token: string) {
		try {
			return jwt.verify(token, env.accessSecret) as jwt.JwtPayload;
		} catch {
			throw new AppError(401, "Authentication required.", "AUTH_REQUIRED");
		}
	}
};

