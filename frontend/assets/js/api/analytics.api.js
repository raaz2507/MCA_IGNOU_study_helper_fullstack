import { apiRequest } from "./client.js";

export const trackVisit = (visit) =>
	apiRequest("/analytics/visit", {
		method: "POST",
		body: JSON.stringify(visit)
	});

export const getAnalyticsSummary = () => apiRequest("/analytics/summary");
