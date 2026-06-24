import { Redis } from "ioredis";
import { env } from "./env.js";

export const redis = new Redis(env.redisUrl, {
	lazyConnect: true,
	maxRetriesPerRequest: null,
	enableOfflineQueue: false,
	connectTimeout: 1_500,
	retryStrategy: () => null
});

export async function connectRedis() {
	try {
		redis.on("error", () => {});
		await redis.connect();
		return true;
	} catch {
		console.warn("Redis is unavailable; queue and presence features are disabled.");
		return false;
	}
}
