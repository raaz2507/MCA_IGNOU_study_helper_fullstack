import { prisma } from "../../config/prisma.js";

export const questionsRepository = {
	subject(folderPath: string) {
		return prisma.subject.findUnique({
			where: { folderPath },
			include: {
				questions: {
					orderBy: { id: "asc" },
					include: { answers: true }
				}
			}
		});
	},
	question(folderPath: string, sourceFile: string) {
		return prisma.question.findFirst({
			where: { sourceFile, subject: { folderPath } },
			include: {
				answers: true,
				subject: { select: { folderPath: true } }
			}
		});
	}
};

