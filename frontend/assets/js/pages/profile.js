import { changePassword, getProfile, updateProfile } from "../api/auth.api.js";

const form = document.getElementById("profileForm");
const message = document.getElementById("profileMessage");
const passwordForm = document.getElementById("passwordForm");
const passwordMessage = document.getElementById("passwordMessage");

async function loadProfile() {
	const profile = await getProfile();
	document.getElementById("profileUsername").value = profile.username;
	document.getElementById("profileDisplayName").value = profile.displayName;
	document.getElementById("profileEmail").value = profile.email;
	document.getElementById("profileRole").value = profile.role;
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	try {
		const saved = await updateProfile({
			displayName: document.getElementById("profileDisplayName").value,
			email: document.getElementById("profileEmail").value
		});
		message.textContent = "Profile saved. Reloading your updated header…";
		message.className = "login-message success";
		document.querySelectorAll("[data-user-name]").forEach((element) => {
			element.textContent = saved.displayName;
		});
	} catch (error) {
		message.textContent = error.message;
		message.className = "login-message error";
	}
});

loadProfile().catch((error) => {
	message.textContent = error.message;
	message.className = "login-message error";
});

passwordForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	const currentPassword = document.getElementById("currentPassword").value;
	const newPassword = document.getElementById("newPassword").value;
	const confirmation = document.getElementById("confirmPassword").value;

	if (newPassword !== confirmation) {
		passwordMessage.textContent = "New password and confirmation do not match.";
		passwordMessage.className = "login-message error";
		return;
	}

	try {
		await changePassword({ currentPassword, newPassword });
		passwordMessage.textContent = "Password updated. Please login again.";
		passwordMessage.className = "login-message success";
		passwordForm.reset();
		window.setTimeout(() => window.location.replace("/login"), 1000);
	} catch (error) {
		passwordMessage.textContent = error.message;
		passwordMessage.className = "login-message error";
	}
});
