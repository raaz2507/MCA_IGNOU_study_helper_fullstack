import { AuthService, ROLE_LEVELS } from "../utils/auth.js";
import { apiRequest } from "../api/client.js";

const tabs = [...document.querySelectorAll("[data-account-tab]")];
const panels = [...document.querySelectorAll("[data-account-panel]")];
const message = document.getElementById("homeAccountMessage");
const auth = new AuthService();

function showPanel(name) {
	tabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.accountTab === name)));
	panels.forEach((panel) => {
		const isActive = panel.dataset.accountPanel === name;
		panel.hidden = !isActive;
		panel.classList.toggle("is-active", isActive);
	});
	message.textContent = "";
}

tabs.forEach((tab) => tab.addEventListener("click", () => showPanel(tab.dataset.accountTab)));

document.getElementById("homeLoginForm").addEventListener("submit", async (event) => {
	event.preventDefault();
	const data = new FormData(event.currentTarget);
	try {
		const session = await auth.login(data.get("username"), data.get("password"));
		window.location.replace(ROLE_LEVELS[session.role] >= ROLE_LEVELS.editor ? "/dashboard" : "/resources");
	} catch (error) {
		message.textContent = error.message;
		message.className = "login-message error";
	}
});

document.getElementById("homeSignupForm").addEventListener("submit", async (event) => {
	event.preventDefault();
	const data = Object.fromEntries(new FormData(event.currentTarget));
	try {
		const result = await apiRequest("/auth/register", {
			method: "POST",
			body: JSON.stringify(data)
		});
		message.textContent = result.status === "ACTIVE"
			? "Account created. You can login now."
			: "Account created and sent for Admin approval.";
		message.className = "login-message success";
		event.currentTarget.reset();
	} catch (error) {
		message.textContent = error.message;
		message.className = "login-message error";
	}
});

document.getElementById("homeForgotForm").addEventListener("submit", (event) => {
	event.preventDefault();
	message.textContent = "Password reset email service is not enabled yet. Please contact the Admin.";
	message.className = "login-message";
});
