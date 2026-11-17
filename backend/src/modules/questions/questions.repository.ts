import { asc, eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { subjects, questions, answers } from "../../infrastructure/database/schema.js";

export const questionsRepository = {
	async subject(folderPath: string) {
		const subRows = await db.select().from(subjects).where(eq(subjects.folderPath, folderPath));
		if (!subRows[0]) return null;
		const sub = subRows[0];

		const qRows = await db.select().from(questions).where(eq(questions.subjectId, sub.id)).orderBy(asc(questions.id));
		const questionIds = new Set(qRows.map((q) => q.id));

		let allAnswers: Array<typeof answers.$inferSelect> = [];
		if (questionIds.size > 0) {
			allAnswers = await db.select().from(answers);
		}

		const answersByQuestion = new Map<string, Array<typeof answers.$inferSelect>>();
		for (const a of allAnswers) {
			if (questionIds.has(a.questionId)) {
				const list = answersByQuestion.get(a.questionId) || [];
				list.push(a);
				answersByQuestion.set(a.questionId, list);
			}
		}

		return {
			...sub,
			questions: qRows.map((q) => ({
				...q,
				answers: answersByQuestion.get(q.id) || []
			}))
		};
	},

	async question(folderPath: string, sourceFile: string) {
		const subRows = await db.select().from(subjects).where(eq(subjects.folderPath, folderPath));
		if (!subRows[0]) return null;
		const sub = subRows[0];

		const qRows = await db.select().from(questions).where(eq(questions.subjectId, sub.id));
		const q = qRows.find((r) => r.sourceFile === sourceFile);
		if (!q) return null;

		const ansRows = await db.select().from(answers).where(eq(answers.questionId, q.id));

		return {
			...q,
			answers: ansRows,
			subject: { folderPath: sub.folderPath }
		};
	}
};
