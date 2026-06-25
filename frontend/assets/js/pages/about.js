const storageKey = "gyanpath-about-feedback";
const form = document.getElementById("feedbackForm");
const message = document.getElementById("feedbackMessage");
const status = document.getElementById("feedbackStatus");

function setStatus(text) {
	if (!status) return;
	status.textContent = text;
}

function restoreFeedback() {
	if (!form || !message) return;
	const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
	if (!saved) return;
	const mood = form.elements.mood;
	if (mood?.value !== undefined) mood.value = saved.mood || "";
	message.value = saved.message || "";
	if (saved.mood) setStatus("Saved on this device.");
}

form?.addEventListener("submit", (event) => {
	event.preventDefault();
	const mood = form.elements.mood?.value || "";
	if (!mood) {
		setStatus("Please choose a mood first.");
		return;
	}
	localStorage.setItem(storageKey, JSON.stringify({
		mood,
		message: message?.value.trim() || "",
		updatedAt: new Date().toISOString()
	}));
	setStatus("Thanks, your feedback is saved.");
});

restoreFeedback();
