import { apiRequest } from "./client.js";

export async function getResourceCollections() {
	return apiRequest("/resource-collections");
}
