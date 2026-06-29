import type { Firestore } from "firebase-admin/firestore";
import { firestoreCollections } from "../../../infrastructure/database/firestore/collections.js";
import type { CreateFeedback, FeedbackRepository } from "../feedback.repository.js";

export class FirestoreFeedbackRepository implements FeedbackRepository {
	constructor(private readonly db: Firestore) {}
	async create(data: CreateFeedback) {
		const createdAt = new Date();
		const ref = await this.db.collection(firestoreCollections.feedback).add({ ...data, createdAt });
		return { id: ref.id, createdAt };
	}
}
