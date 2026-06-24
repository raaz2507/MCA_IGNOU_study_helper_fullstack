import { Queue } from "bullmq";
import { env } from "../config/env.js";

export function createQueues(redisReady: boolean) {
	if (!redisReady) return null;
	const url = new URL(env.redisUrl);
	const connection = {
		host: url.hostname,
		port: Number(url.port || 6379),
		username: url.username || undefined,
		password: url.password || undefined
	};
	return {
		notifications: new Queue("notifications", { connection }),
		email: new Queue("email", { connection }),
		pdf: new Queue("pdf-processing", { connection })
	};
}
