import { createServer } from "node:http";
import { exec } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { lectureCatalogService } from "./modules/content/lecture-catalog.service.js";

function tryAutoOpenBrowser(url: string) {
	if (env.nodeEnv === "test" || !env.openBrowser) return;

	const lockFile = path.join(tmpdir(), "gyanpath_browser_open.lock");
	const now = Date.now();
	if (existsSync(lockFile)) {
		try {
			const lastTime = Number(readFileSync(lockFile, "utf8"));
			// Skip opening if opened within the last 45 seconds (prevents spamming tabs on hot-reload)
			if (now - lastTime < 45_000) return;
		} catch {
			// ignore read error
		}
	}

	try {
		writeFileSync(lockFile, String(now), "utf8");
	} catch {
		// ignore write error
	}

	const platform = process.platform;
	const command = platform === "win32"
		? `start "" "${url}"`
		: platform === "darwin"
			? `open "${url}"`
			: `xdg-open "${url}"`;

	exec(command, () => {});
}

async function start() {
	try {
		const result = await lectureCatalogService.sync(false);
		console.log(`Lecture catalog startup sync: ${result.added} added, ${result.skipped} existing.`);
	} catch (error) {
		console.warn("Lecture catalog startup sync skipped:", error instanceof Error ? error.message : error);
	}

	const app = createApp();
	const server = createServer(app);

	server.listen(env.port, "0.0.0.0", () => {
		const localUrl = `http://localhost:${env.port}`;
		console.log(`GyanPath Express app: ${localUrl} (network: http://0.0.0.0:${env.port})`);
		tryAutoOpenBrowser(localUrl);
	});

	const shutdown = async () => {
		server.close();
		process.exit(0);
	};
	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
}

start().catch((error) => {
	console.error(error);
	process.exit(1);
});
