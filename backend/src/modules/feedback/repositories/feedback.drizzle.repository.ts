import { randomUUID } from "node:crypto";
import { db } from "../../../config/db.js";
import { feedback } from "../../../infrastructure/database/schema.js";
import type { FeedbackRepository, CreateFeedback } from "../feedback.repository.js";

export class DrizzleFeedbackRepository implements FeedbackRepository {
	async create(data: CreateFeedback): Promise<{ id: string; createdAt: Date }> {
		const id = randomUUID();
		const now = new Date();
		await db.insert(feedback).values({
			id,
			userId: data.userId,
			visitorHash: data.visitorHash,
			mood: data.mood,
			message: data.message,
			pagePath: data.pagePath,
			createdAt: now.toISOString()
		});
		return { id, createdAt: now };
	}
}
