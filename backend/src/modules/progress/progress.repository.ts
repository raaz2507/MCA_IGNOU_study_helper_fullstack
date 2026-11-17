import { and, eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { progress, questions, subjects } from "../../infrastructure/database/schema.js";

export const progressRepository = {
	async list(userId: string, folderPath: string) {
		const rows = await db.select({
			questionId: progress.questionId,
			completed: progress.completed,
			revision: progress.revision,
			bookmarked: progress.bookmarked
		})
		.from(progress)
		.innerJoin(questions, eq(progress.questionId, questions.id))
		.innerJoin(subjects, eq(questions.subjectId, subjects.id))
		.where(and(eq(progress.userId, userId), eq(subjects.folderPath, folderPath)));

		return rows;
	},

	async save(userId: string, folderPath: string, state: any) {
		const qRows = await db.select({ id: questions.id })
			.from(questions)
			.innerJoin(subjects, eq(questions.subjectId, subjects.id))
			.where(eq(subjects.folderPath, folderPath));

		const done = new Set(state.done || []);
		const revision = new Set(state.revision || []);
		const bookmarks = new Set(state.bookmarks || []);
		const now = new Date().toISOString();

		await db.transaction(async (tx) => {
			for (const { id } of qRows) {
				await tx.insert(progress)
					.values({
						userId,
						questionId: id,
						completed: done.has(id),
						revision: revision.has(id),
						bookmarked: bookmarks.has(id),
						updatedAt: now
					})
					.onConflictDoUpdate({
						target: [progress.userId, progress.questionId],
						set: {
							completed: done.has(id),
							revision: revision.has(id),
							bookmarked: bookmarks.has(id),
							updatedAt: now
						}
					});
			}
		});
	}
};
