import { apiRequest } from "./client.js";

export const getProgress = (subject) =>
	apiRequest(`/progress?subject=${encodeURIComponent(subject)}`);
export const updateProgress = (subject, payload) =>
	apiRequest(`/progress?subject=${encodeURIComponent(subject)}`, {
		method: "PUT",
		body: JSON.stringify(payload)
	});
