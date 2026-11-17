import assert from "node:assert/strict";
import test from "node:test";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { eq } from "drizzle-orm";
import { createApp } from "../app.js";
import { db } from "../config/db.js";
import { users, appSettings } from "../infrastructure/database/schema.js";
import { hashToken } from "../modules/auth/auth.repository.js";

test("email verification blocks login until a valid token is consumed", async () => {
	const username = `verify-test-${Date.now()}`;
	const email = `${username}@example.com`;
	const token = "v".repeat(64);
	const prevRows = await db.select().from(appSettings).where(eq(appSettings.key, "email-verification"));
	const previousSetting = prevRows[0];
	const userId = randomUUID();
	const now = new Date().toISOString();

	await db.insert(users).values({
		id: userId,
		username,
		email,
		displayName: "Verification Test",
		passwordHash: await bcrypt.hash("verification-test-password", 4),
		status: "ACTIVE",
		emailVerificationRequired: true,
		emailVerificationTokenHash: hashToken(token),
		emailVerificationExpiresAt: new Date(Date.now() + 60_000).toISOString(),
		createdAt: now,
		updatedAt: now
	});

	await db.insert(appSettings)
		.values({ key: "email-verification", value: { enabled: true }, updatedAt: now })
		.onConflictDoUpdate({
			target: appSettings.key,
			set: { value: { enabled: true }, updatedAt: now }
		});

	try {
		const app = createApp();
		const blocked = await request(app).post("/api/auth/login").send({
			username,
			password: "verification-test-password"
		});
		assert.equal(blocked.status, 403);
		assert.equal(blocked.body.code, "EMAIL_NOT_VERIFIED");

		const verified = await request(app).post("/api/auth/verify-email").send({ token });
		assert.equal(verified.status, 200);
		assert.equal(verified.body.success, true);

		const login = await request(app).post("/api/auth/login").send({
			username,
			password: "verification-test-password"
		});
		assert.equal(login.status, 200);
	} finally {
		await db.delete(users).where(eq(users.id, userId));
		if (previousSetting) {
			await db.update(appSettings)
				.set({ value: previousSetting.value, updatedAt: new Date().toISOString() })
				.where(eq(appSettings.key, "email-verification"));
		} else {
			await db.delete(appSettings).where(eq(appSettings.key, "email-verification"));
		}
	}
});
