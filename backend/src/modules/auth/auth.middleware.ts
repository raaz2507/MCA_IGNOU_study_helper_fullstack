import type { RequestHandler } from "express";
import { UserRole, type UserRole as UserRoleType } from "../../domain/auth/roles.js";
import { AppError } from "../../shared/errors/app-error.js";
import { authService } from "./auth.service.js";

export const requireAuth: RequestHandler = (request, _response, next) => {
	try {
		const token = request.cookies?.gyanpath_access;
		if (!token) throw new AppError(401, "Authentication required.", "AUTH_REQUIRED");
		const payload = authService.verifyAccess(token);
		request.user = {
			id: String(payload.sub),
			username: String(payload.username),
			displayName: String(payload.displayName),
			role: String(payload.role) as UserRoleType
		};
		next();
	} catch (error) {
		next(error);
	}
};

export const requireRoles = (...roles: UserRoleType[]): RequestHandler[] => [
	requireAuth,
	(request, _response, next) => {
		if (!request.user || !roles.includes(request.user.role)) {
			next(new AppError(403, "You do not have permission for this action.", "FORBIDDEN"));
			return;
		}
		next();
	}
];

