import { deleteContent, getContent, saveContent } from "../api/content.api.js";

export const createId = () => crypto.randomUUID();

export async function getContributors() {
	return getContent("contributors");
}

export async function saveContributor(contributor) {
	return saveContent("contributors", contributor);
}

export async function removeContributor(id) {
	return deleteContent("contributors", id);
}

export function contributorInitials(name) {
	return String(name || "?")
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() || "")
		.join("") || "?";
}
