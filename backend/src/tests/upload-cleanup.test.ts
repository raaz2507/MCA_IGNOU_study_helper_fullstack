import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import crypto from "node:crypto";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { contentRepository } from "../modules/content/content.repository.js";

const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function absoluteUpload(publicPath: string | null) {
	if (!publicPath?.startsWith("/uploads/")) throw new Error("Expected an upload path.");
	return path.join(env.projectRoot, publicPath.slice(1).replaceAll("/", path.sep));
}

test("replacing and deleting a banner removes its superseded upload files", async () => {
	const id = `upload-cleanup-${crypto.randomUUID()}`;
	const uploadDirectory = path.join(env.projectRoot, "uploads", "banners", id);
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
		await prisma.banner.deleteMany({ where: { id } });
		await fs.rm(uploadDirectory, { recursive: true, force: true });
	}
});
