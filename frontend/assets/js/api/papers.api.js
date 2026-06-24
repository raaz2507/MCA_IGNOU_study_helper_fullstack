import { apiRequest } from "./client.js";

export async function getPapers(subject = "") {
	const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
	return apiRequest(`/papers${query}`);
}
