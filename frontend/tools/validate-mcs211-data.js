const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(
  root,
  "assets",
  "resources",
  "MCA_new",
  "Semester_1",
  "MCS_211",
  "data",
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(dataDir, "manifest.json"), "utf8"),
);
const errors = [];
const warnings = [];
const ids = new Set();

for (const question of manifest.questions || []) {
  if (ids.has(question.id)) errors.push(`Duplicate id: ${question.id}`);
  ids.add(question.id);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(question.classification?.chapterId || "")) {
    errors.push(`${question.id}: invalid chapterId`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(question.classification?.topicId || "")) {
    errors.push(`${question.id}: invalid topicId`);
  }
  if (!["easy", "medium", "hard"].includes(question.difficulty)) {
    errors.push(`${question.id}: invalid difficulty`);
  }
  if (question.marks !== null && (!Number.isFinite(question.marks) || question.marks < 1 || question.marks > 20)) {
    errors.push(`${question.id}: invalid marks`);
  }
  if (!Array.isArray(question.tags) || !question.tags.length) {
    errors.push(`${question.id}: tags missing`);
  }
  for (const tag of question.tags || []) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag)) {
      errors.push(`${question.id}: invalid tag "${tag}"`);
    }
  }

  const filePath = path.join(dataDir, question.file);
  if (question.hasAnswer && !fs.existsSync(filePath)) {
    errors.push(`${question.id}: answer file missing`);
  }
  if (!question.hasAnswer && !fs.existsSync(filePath)) {
    warnings.push(`${question.id}: content pending`);
  }
}

const q1 = JSON.parse(
  fs.readFileSync(path.join(dataDir, "MCS211-Q001.json"), "utf8"),
);
if (q1.id !== "MCS211-Q001") errors.push("MCS211-Q001: id mismatch");
for (const media of q1.media || []) {
  if (!fs.existsSync(path.join(dataDir, "images", media.file))) {
    errors.push(`${q1.id}: media missing ${media.file}`);
  }
}

console.log(
  JSON.stringify(
    {
      valid: errors.length === 0,
      questionCount: manifest.questions.length,
      errors,
      warningCount: warnings.length,
      warnings,
    },
    null,
    2,
  ),
);

if (errors.length) process.exitCode = 1;
