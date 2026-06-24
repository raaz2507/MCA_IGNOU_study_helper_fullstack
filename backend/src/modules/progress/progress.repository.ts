import { prisma } from "../../config/prisma.js";

export const progressRepository = {
	async list(userId: string, folderPath: string) {
		return prisma.progress.findMany({
			where: { userId, question: { subject: { folderPath } } },
			select: {
				questionId: true,
				completed: true,
				revision: true,
				bookmarked: true
			}
		});
	},
	async save(userId: string, folderPath: string, state: any) {
		const questions = await prisma.question.findMany({
			where: { subject: { folderPath } },
			select: { id: true }
		});
		const done = new Set(state.done || []);
		const revision = new Set(state.revision || []);
		const bookmarks = new Set(state.bookmarks || []);

		await prisma.$transaction(
			questions.map(({ id }) =>
				prisma.progress.upsert({
					where: { userId_questionId: { userId, questionId: id } },
					update: {
						completed: done.has(id),
						revision: revision.has(id),
						bookmarked: bookmarks.has(id)
					},
					create: {
						userId,
						questionId: id,
						completed: done.has(id),
						revision: revision.has(id),
						bookmarked: bookmarks.has(id)
					}
				})
			)
		);
	}
};

