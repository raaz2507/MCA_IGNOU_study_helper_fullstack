import { apiRequest } from "./client.js";

export async function getSubjects() {
	return apiRequest("/subjects");
}
