import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../app.js";

test("catalog, papers and question bank come from PostgreSQL", async () => {
	const app = createApp();
	const subjects = await request(app).get("/api/subjects");
	assert.equal(subjects.status, 200);
	assert.ok(subjects.body.length >= 4);

	const papers = await request(app).get("/api/papers").query({ subject: "MCS-211" });
	assert.equal(papers.status, 200);
	assert.ok(papers.body.length > 0);

	const manifest = await request(app)
		.get("/api/questions/manifest")
		.query({ subject: "MCA_new/Semester_1/MCS_211" });
	assert.equal(manifest.status, 200);
	assert.equal(manifest.body.questions.length, 91);
});

test("JWT cookie login protects and persists progress in PostgreSQL", async () => {
	const agent = request.agent(createApp());
	const login = await agent.post("/api/auth/login").send({
		username: "user",
		password: "user123"
	});
	assert.equal(login.status, 200);

	const subject = "MCA_new/Semester_1/MCS_211";
	const saved = await agent.put("/api/progress").query({ subject }).send({
		done: ["MCS211-Q001"],
		bookmarks: ["MCS211-Q001"],
		revision: []
	});
	assert.equal(saved.status, 200);

	const loaded = await agent.get("/api/progress").query({ subject });
	assert.equal(loaded.status, 200);
	assert.deepEqual(loaded.body.done, ["MCS211-Q001"]);

	await agent.put("/api/progress").query({ subject }).send({
		done: [],
		bookmarks: [],
		revision: []
	});
	await agent.post("/api/auth/logout");
});

test("admin content writes require role authorization", async () => {
	const app = createApp();
	const denied = await request(app).post("/api/content/lectures").send({ title: "Denied" });
	assert.equal(denied.status, 401);

	const agent = request.agent(app);
	const login = await agent.post("/api/auth/login").send({
		username: "admin",
		password: "admin123"
	});
	assert.equal(login.status, 200);

	const saved = await agent.post("/api/content/lectures").send({
		subject: "MCS-211",
		title: "Integration lecture",
		url: "https://example.com/video",
		language: "English",
		active: true
	});
	assert.equal(saved.status, 200);
	await agent.delete(`/api/content/lectures/${saved.body.id}`);
	await agent.post("/api/auth/logout");
});

test("admin control panel APIs expose overview and protect role management", async () => {
	const denied = await request(createApp()).get("/api/admin/overview");
	assert.equal(denied.status, 401);

	const agent = request.agent(createApp());
	const login = await agent.post("/api/auth/login").send({
		username: "admin",
		password: "admin123"
	});
	assert.equal(login.status, 200);

	const overview = await agent.get("/api/admin/overview");
	assert.equal(overview.status, 200);
	assert.ok(overview.body.users >= 3);
	assert.ok(overview.body.subjects >= 22);

	const users = await agent.get("/api/admin/users");
	assert.equal(users.status, 200);
	assert.ok(users.body.some((user: any) => user.username === "admin"));

	const subjects = await agent.get("/api/admin/subjects");
	assert.equal(subjects.status, 200);
	assert.ok(subjects.body.some((subject: any) => subject.code === "MCS-211" && subject.id));

	const system = await agent.get("/api/admin/system");
	assert.equal(system.status, 200);
	assert.equal(system.body.database, "connected");
	await agent.post("/api/auth/logout");
});

test("editors can manage link preview settings without receiving Admin-only access", async () => {
	const editorAgent = request.agent(createApp());
	const login = await editorAgent.post("/api/auth/login").send({
		username: "editor",
		password: "editor123"
	});
	assert.equal(login.status, 200);

	const linkPreviewSettings = await editorAgent.get("/api/admin/settings/link-preview");
	assert.equal(linkPreviewSettings.status, 200);
	assert.ok(linkPreviewSettings.body.imageUrl || linkPreviewSettings.body.imagePath);

	const adminOverview = await editorAgent.get("/api/admin/overview");
	assert.equal(adminOverview.status, 403);
	const resetAttempt = await editorAgent.delete("/api/admin/settings/link-preview");
	assert.equal(resetAttempt.status, 403);
	await editorAgent.post("/api/auth/logout");
});

test("analytics records anonymous visits and exposes admin summary", async () => {
	const app = createApp();
	const tracked = await request(app).post("/api/analytics/visit").send({
		visitorId: "test-visitor-analytics-001",
		sessionId: "test-session-analytics-001",
		pagePath: "/resources",
		referrer: "https://www.google.com/search?q=ignou+mca",
		deviceType: "desktop",
		browser: "Chrome"
	});
	assert.equal(tracked.status, 204);

	const agent = request.agent(app);
	const login = await agent.post("/api/auth/login").send({
		username: "admin",
		password: "admin123"
	});
	assert.equal(login.status, 200);

	const summary = await agent.get("/api/analytics/summary");
	assert.equal(summary.status, 200);
	assert.ok(summary.body.totalVisits >= 1);
	assert.ok(summary.body.topPages.some((page: any) => page.label === "/resources"));
	await agent.post("/api/auth/logout");
});
