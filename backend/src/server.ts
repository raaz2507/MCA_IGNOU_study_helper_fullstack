import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { connectRedis } from "./config/redis.js";
import { createSocketServer } from "./config/socket.js";
import { createQueues } from "./queues/index.js";
import { lectureCatalogService } from "./modules/content/lecture-catalog.service.js";

async function start() {
	await prisma.$connect();
	try {
		const result = await lectureCatalogService.sync(false);
		console.log(`Lecture catalog startup sync: ${result.added} added, ${result.skipped} existing.`);
	} catch (error) {
		console.warn("Lecture catalog startup sync skipped:", error instanceof Error ? error.message : error);
	}
	const redisReady = await connectRedis();

	const app = createApp();
	const server = createServer(app);
	createSocketServer(server);
	createQueues(redisReady);

	server.listen(env.port, "0.0.0.0", () => {
		console.log(`GyanPath Express app: http://0.0.0.0:${env.port}`);
	});

	const shutdown = async () => {
		server.close();
		await prisma.$disconnect();
		process.exit(0);
	};
	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
}

start().catch((error) => {
	console.error(error);
	process.exit(1);
});

