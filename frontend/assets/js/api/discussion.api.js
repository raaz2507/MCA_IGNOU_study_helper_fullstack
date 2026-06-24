import { apiRequest } from "./client.js";

export const getDiscussions = (subjectId) =>
	apiRequest(`/discussions?subject=${encodeURIComponent(subjectId || "")}`);

export const createDiscussion = (payload) =>
	apiRequest("/discussions", {
		method: "POST",
		body: JSON.stringify(payload)
	});
