import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { contentSetup } from "../config/content.setup.js";
import { env } from "../config/env.js";
import { scanContent } from "../infrastructure/content/content-scanner.js";

test("content scanner discovers configured PDF collections", () => {
	const root = path.join(env.localResourcesRoot, contentSetup.folders.contentRoot);
	const manifest = scanContent(root);

	assert.equal(manifest.version, 1);
	assert.equal(manifest.program.code, contentSetup.program.code);
	assert.ok(manifest.files.some((file) => file.kind === "program-guide"));
	assert.ok(manifest.files.some((file) => file.kind === "assignment"));
	assert.ok(manifest.files.some((file) => file.kind === "study-material"));
	assert.ok(manifest.files.some((file) => file.kind === "question-paper"));
	assert.ok(manifest.files.every((file) => file.path.endsWith(".pdf")));
	assert.ok(manifest.files.every((file) => file.checksum.length === 64));
});
