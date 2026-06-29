import type { FeedbackRepository, CreateFeedback } from "../feedback.repository.js";

export class PrismaFeedbackRepository implements FeedbackRepository {
	async create(data: CreateFeedback) {
		const { prisma } = await import("../../../config/prisma.js");
		return prisma.feedback.create({ data, select: { id: true, createdAt: true } });
	}
}
