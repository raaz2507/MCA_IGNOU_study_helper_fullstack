import {
	getCurrentUser,
	login as loginRequest,
	logout as logoutRequest
} from "../api/auth.api.js";

export const ROLE_LEVELS = Object.freeze({
	user: 1,
	editor: 2,
	admin: 3
});

export class AuthService {
	async login(username, password) {
		return loginRequest({ username, password });
	}

	async logout() {
		await logoutRequest();
	}

	async getSession() {
		try {
			return await getCurrentUser();
		} catch {
			return null;
		}
	}
}

export class AccessController {
	constructor(authService = new AuthService()) {
		this.authService = authService;
	}

	async protectPage(allowedRoles) {
		const session = await this.authService.getSession();
		if (!session) return this.redirectToLogin();
		if (!allowedRoles.includes(session.role)) {
			window.location.replace("/access-denied");
			return;
		}

		document.body.classList.remove("auth-pending");
		this.renderSession(session);
		this.bindLogout();
		this.applyRoleVisibility(session.role);
	}

	redirectToLogin() {
		const page = `${window.location.pathname.split("/").pop()}${window.location.search}`;
		window.location.replace(`/login?${new URLSearchParams({ return: page })}`);
	}

	renderSession(session) {
		document.querySelectorAll("[data-user-name]").forEach((element) => {
			element.textContent = session.displayName;
		});
		document.querySelectorAll("[data-user-role]").forEach((element) => {
			element.textContent = session.role;
		});
		document.querySelectorAll("[data-user-initial]").forEach((element) => {
			element.textContent = (session.displayName || session.username || "U").trim().charAt(0).toUpperCase();
		});
	}

	bindLogout(destination = "/login") {
		document.querySelectorAll("[data-logout]").forEach((button) => {
			if (button.dataset.logoutBound === "true") return;
			button.dataset.logoutBound = "true";
			button.addEventListener("click", async () => {
				await this.authService.logout();
				window.location.replace(destination);
			});
		});
	}

	applyRoleVisibility(role) {
		document.querySelectorAll("[data-visible-for]").forEach((element) => {
			const roles = element.dataset.visibleFor.split(",").map((item) => item.trim());
			element.hidden = !roles.includes(role);
		});
	}
}
