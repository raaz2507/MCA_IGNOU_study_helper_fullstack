import { AccessController } from "./auth.js";

class ProtectedPage {
	constructor() {
		this.allowedRoles = String(document.body.dataset.allowedRoles || "")
			.split(",")
			.map((role) => role.trim())
			.filter(Boolean);
		this.initialize();
	}

	initialize() {
		if (!this.allowedRoles.length) {
			document.body.classList.remove("auth-pending");
			return;
		}

		new AccessController().protectPage(this.allowedRoles);
	}
}

new ProtectedPage();

