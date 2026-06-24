import { progressRepository } from "./progress.repository.js";

export const progressService = {
	async get(userId: string, subject: string) {
		const rows = await progressRepository.list(userId, subject);
		return {
			done: rows.filter((row) => row.completed).map((row) => row.questionId),
			bookmarks: rows.filter((row) => row.bookmarked).map((row) => row.questionId),
			revision: rows.filter((row) => row.revision).map((row) => row.questionId)
		};
	},
	async save(userId: string, subject: string, state: any) {
		const normalized = {
			done: [...new Set((state.done || []).map(String))],
			bookmarks: [...new Set((state.bookmarks || []).map(String))],
			revision: [...new Set((state.revision || []).map(String))]
		};
		await progressRepository.save(userId, subject, normalized);
		return normalized;
	}
};

