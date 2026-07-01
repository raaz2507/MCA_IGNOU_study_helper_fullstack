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
export const getLectureCatalog = () => apiRequest("/content/lectures/catalog");
export const validateLectureCatalog = (content) => apiRequest("/content/lectures/catalog/validate", {
	method: "POST", body: JSON.stringify({ content })
});
export const saveLectureCatalog = (content) => apiRequest("/content/lectures/catalog", {
	method: "PUT", body: JSON.stringify({ content })
});
export const syncLectureCatalog = () => apiRequest("/content/lectures/catalog/sync", {
	method: "POST", body: JSON.stringify({ updateExisting: true })
});
