import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../app.js";

test("static routes and question-bank assets load successfully", async () => {
	const app = createApp();

	const indexCss = await request(app).get("/assets/css/index.css");
	assert.equal(indexCss.status, 200);
	assert.match(indexCss.text, /GyanPath CSS Architecture/);

	const appPaperCss = await request(app).get("/assets/css/app-paper.css");
	assert.equal(appPaperCss.status, 200);
	assert.match(appPaperCss.text, /tokens\.css/);

	const questionBank = await request(app).get("/question-bank");
	assert.equal(questionBank.status, 200);

	const mcs211 = await request(app).get("/storage/resources/MCA_new/Semester_1/MCS_211/exam_papers/mcs_211.html");
	assert.equal(mcs211.status, 200);
	assert.ok(mcs211.text.length > 1000);
});
