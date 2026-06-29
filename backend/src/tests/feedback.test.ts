import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../config/prisma.js";

test("feedback is persisted instead of only stored in the browser", async () => {
	const response = await request(createApp()).post("/api/feedback").send({
		mood: "happy",
		message: "Repository migration test",
		pagePath: "/about",
		visitorId: "feedback-test-visitor"
	});
	assert.equal(response.status, 201);
	const saved = await prisma.feedback.findUnique({ where: { id: response.body.id } });
	assert.equal(saved?.mood, "happy");
	assert.equal(saved?.message, "Repository migration test");
	await prisma.feedback.delete({ where: { id: response.body.id } });
});
