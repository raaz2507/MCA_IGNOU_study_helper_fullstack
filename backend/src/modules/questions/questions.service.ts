import { AppError } from "../../shared/errors/app-error.js";
import { questionsRepository } from "./questions.repository.js";

function metadata(question: any) {
	const related = (question.relatedData || {}) as any;
	return {
		id: question.id,
		file: question.sourceFile,
		title: question.title,
		marks: question.marks,
		difficulty: question.difficulty,
		classification: related.classification || {
			chapterTitle: question.category
		},
		tags: question.tags,
		appearedIn: question.appearedIn,
		groupId: related.groupId || null,
		contentStatus: question.contentStatus.toLowerCase(),
		hasAnswer: question.answers.length > 0,
		mediaCount: Array.isArray(question.media) ? question.media.length : 0
	};
}

export const questionsService = {
	async manifest(folderPath: string) {
		const subject = await questionsRepository.subject(folderPath);
		if (!subject) throw new AppError(404, "Question bank not found.", "QUESTION_BANK_NOT_FOUND");

		const groups: Record<string, any> = {};
		for (const question of subject.questions) {
			const groupId = (question.relatedData as any)?.groupId;
			if (!groupId) continue;
			groups[groupId] ||= { id: groupId, title: question.category || groupId, questionIds: [], frequency: 0 };
			groups[groupId].questionIds.push(question.id);
			groups[groupId].frequency += 1;
		}

		return {
			schemaVersion: 2,
			subject: {
				id: subject.id,
				code: subject.code,
				title: subject.title
			},
			paths: {
				questions: "data/",
				media: "data/images/"
			},
			groups,
			questions: subject.questions.map(metadata)
		};
	},
	async question(folderPath: string, sourceFile: string) {
		const question = await questionsRepository.question(folderPath, sourceFile);
		if (!question) throw new AppError(404, "Question content not found.", "QUESTION_NOT_FOUND");

		const answers: Record<string, Record<string, string>> = {};
		for (const answer of question.answers) {
			answers[answer.language] ||= {};
			answers[answer.language][answer.mode] = answer.content;
		}

		return {
			...metadata(question),
			question: { markdown: question.questionMd || question.title },
			answers,
			media: question.media || []
		};
	}
};

