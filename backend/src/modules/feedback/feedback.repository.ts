export type CreateFeedback = {
	userId: string | null;
	visitorHash: string | null;
	mood: string;
	message: string;
	pagePath: string;
};

export interface FeedbackRepository {
	create(data: CreateFeedback): Promise<{ id: string; createdAt: Date }>;
}
