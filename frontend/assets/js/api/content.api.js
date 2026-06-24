import { apiRequest } from "./client.js";

export const getContent = (name) => apiRequest(`/content/${name}`);
export const saveContent = (name, item) =>
	apiRequest(`/content/${name}`, {
		method: "POST",
		body: JSON.stringify(item)
	});
export const deleteContent = (name, id) =>
	apiRequest(`/content/${name}/${encodeURIComponent(id)}`, { method: "DELETE" });
export const fetchLectureMetadata = (url) =>
	apiRequest("/content/lectures/metadata", {
		method: "POST",
		body: JSON.stringify({ url })
	});
