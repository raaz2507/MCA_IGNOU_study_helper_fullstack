export const UserRole = Object.freeze({
	USER: "USER",
	EDITOR: "EDITOR",
	MODERATOR: "MODERATOR",
	ADMIN: "ADMIN"
} as const);

export type UserRole = typeof UserRole[keyof typeof UserRole];
export const USER_ROLES = Object.values(UserRole) as [UserRole, ...UserRole[]];
