import type { UserRole } from "../../domain/auth/roles.js";

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				username: string;
				displayName: string;
				role: UserRole;
			};
		}
	}
}

export {};
