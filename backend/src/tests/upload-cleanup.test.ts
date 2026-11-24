import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { env } from "../config/env.js";
import { db } from "../config/db.js";
import { banners } from "../infrastructure/database/schema.js";
import { contentRepository } from "../modules/content/content.repository.js";
import { storageService } from "../infrastructure/storage/storage.service.js";

const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function absoluteUpload(publicPath: string | null) {
	if (!publicPath?.startsWith("/storage/uploads/")) throw new Error("Expected an upload path.");
	return storageService.uploadPublicPathToAbsolute(publicPath);
}

test("replacing and deleting a banner removes its superseded upload files", async () => {
	const id = `upload-cleanup-${crypto.randomUUID()}`;
	const uploadDirectory = path.join(storageService.uploadsRoot, "banners", id);
	try {
		const first = await contentRepository.saveBanner({
			id,
			title: "Cleanup test",
			description: "First image",
			category: "Test",
			image: pixel,
			priority: 9999,
			active: false
		});
		const firstFile = absoluteUpload(first.image);
		assert.equal(existsSync(firstFile), true);

		const second = await contentRepository.saveBanner({
			id,
			title: "Cleanup test",
			description: "Replacement image",
			category: "Test",
			image: pixel,
			priority: 9999,
			active: false
		});
		const secondFile = absoluteUpload(second.image);
		assert.notEqual(secondFile, firstFile);
		assert.equal(existsSync(firstFile), false);
		assert.equal(existsSync(secondFile), true);

		await contentRepository.deleteBanner(id);
		assert.equal(existsSync(secondFile), false);
	} finally {
		await db.delete(banners).where(eq(banners.id, id));
		await fs.rm(uploadDirectory, { recursive: true, force: true });
	}
});
