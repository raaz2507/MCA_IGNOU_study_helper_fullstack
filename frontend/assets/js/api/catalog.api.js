import { apiRequest } from "./client.js";

/**
 * Academic Catalog API Client
 * Centralized service for programs, subjects, papers and study collections.
 */

export async function getPrograms() {
	return apiRequest("/programs");
}

export async function getCatalog(program = "") {
	const query = program ? `?program=${encodeURIComponent(program)}` : "";
	return apiRequest(`/catalog${query}`);
}

export async function getSubjects(program = "") {
	const query = program ? `?program=${encodeURIComponent(program)}` : "";
	return apiRequest(`/subjects${query}`);
}

export async function getPapers(subject = "") {
	const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
	return apiRequest(`/papers${query}`);
}

export async function getResourceCollections(program = "") {
	const query = program ? `?program=${encodeURIComponent(program)}` : "";
	return apiRequest(`/resource-collections${query}`);
}
