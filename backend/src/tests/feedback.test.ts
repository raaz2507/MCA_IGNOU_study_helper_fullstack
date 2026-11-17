import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { eq } from "drizzle-orm";
import { createApp } from "../app.js";
import { db } from "../config/db.js";
import { feedback } from "../infrastructure/database/schema.js";

test("feedback is persisted instead of only stored in the browser", async () => {
	const response = await request(createApp()).post("/api/feedback").send({
		mood: "happy",
		message: "Repository migration test",
		pagePath: "/about",
		visitorId: "feedback-test-visitor"
	});
	assert.equal(response.status, 201);
	const rows = await db.select().from(feedback).where(eq(feedback.id, response.body.id));
	const saved = rows[0];
	assert.equal(saved?.mood, "happy");
	assert.equal(saved?.message, "Repository migration test");
	await db.delete(feedback).where(eq(feedback.id, response.body.id));
});
