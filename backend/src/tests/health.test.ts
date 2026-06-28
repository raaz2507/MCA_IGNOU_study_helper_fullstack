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
	assert.match(response.text, /<title>GyanPath \| Learn, Revise, Succeed<\/title>/);
	assert.match(response.text, /href="\/resources">Browse Study Resources<\/a>/);
	assert.match(response.text, /<header class="site-header">/);
	assert.match(response.text, /<footer class="site-footer">/);
	assert.doesNotMatch(response.text, /<%=/);
});

test("resources page is server-rendered from Eta", async () => {
	const response = await request(createApp()).get("/resources");
	assert.equal(response.status, 200);
	assert.match(response.text, /<title>Study Resources \| GyanPath<\/title>/);
	assert.match(response.text, /id="semesterContainer" data-ssr-subjects/);
	assert.match(response.text, /data-ssr-subject/);
	assert.match(response.text, /aria-current="page">Resources<\/a>/);
	assert.doesNotMatch(response.text, /<%=/);
});

test("about page uses the shared Eta shell", async () => {
	const response = await request(createApp()).get("/about");
	assert.equal(response.status, 200);
	assert.match(response.text, /<title>About \| GyanPath<\/title>/);
	assert.match(response.text, /id="contributorsGrid" class="contributors-grid" data-ssr-contributors/);
	assert.match(response.text, /id="feedbackForm"/);
	assert.match(response.text, /aria-current="page">About<\/a>/);
	assert.doesNotMatch(response.text, /<%=/);
});

test("legacy HTML page URLs redirect to clean routes", async () => {
	const response = await request(createApp()).get("/admin.html?tab=users");
	assert.equal(response.status, 301);
	assert.equal(response.headers.location, "/admin?tab=users");
});
