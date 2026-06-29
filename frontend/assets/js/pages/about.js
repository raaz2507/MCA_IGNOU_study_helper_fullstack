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

function visitorId() {
	const key = "gyanpath-feedback-visitor";
	let value = localStorage.getItem(key);
	if (!value) {
		value = crypto.randomUUID();
		localStorage.setItem(key, value);
	}
	return value;
}

form?.addEventListener("submit", async (event) => {
	event.preventDefault();
	const mood = form.elements.mood?.value || "";
	if (!mood) {
		setStatus("Please choose a mood first.");
		return;
	}
	const payload = {
		mood,
		message: message?.value.trim() || "",
		pagePath: window.location.pathname,
		visitorId: visitorId()
	};
	setStatus("Sending feedback…");
	try {
		const response = await fetch("/api/feedback", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(payload)
		});
		if (!response.ok) throw new Error("Feedback could not be submitted.");
		localStorage.removeItem(storageKey);
		form.reset();
		setStatus("Thanks, your feedback was submitted.");
	} catch {
		localStorage.setItem(storageKey, JSON.stringify({ ...payload, updatedAt: new Date().toISOString() }));
		setStatus("You appear offline. A draft was saved on this device.");
	}
});

restoreFeedback();
