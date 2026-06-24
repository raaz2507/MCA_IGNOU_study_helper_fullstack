import { apiRequest } from "./client.js";

export const login = (credentials) =>
	apiRequest("/auth/login", {
		method: "POST",
		body: JSON.stringify(credentials)
	});

export const getCurrentUser = () => apiRequest("/auth/me");
export const getProfile = () => apiRequest("/auth/profile");
export const updateProfile = (profile) =>
	apiRequest("/auth/profile", { method: "PUT", body: JSON.stringify(profile) });
export const changePassword = (passwords) =>
	apiRequest("/auth/password", { method: "PUT", body: JSON.stringify(passwords) });
export const logout = () => apiRequest("/auth/logout", { method: "POST" });
