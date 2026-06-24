import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../app.js";

test("health API returns Express status", async () => {
	const response = await request(createApp()).get("/api/health");
	assert.equal(response.status, 200);
	assert.equal(response.body.status, "ok");
	assert.equal(response.body.architecture, "express-modular-monolith");
});

test("frontend home page is served at the clean root route", async () => {
	const response = await request(createApp()).get("/");
	assert.equal(response.status, 200);
	assert.match(response.text, /GyanPath/);
});

test("legacy HTML page URLs redirect to clean routes", async () => {
	const response = await request(createApp()).get("/admin.html?tab=users");
	assert.equal(response.status, 301);
	assert.equal(response.headers.location, "/admin?tab=users");
});
