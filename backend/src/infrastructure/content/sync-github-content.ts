import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { and, eq, notInArray, sql } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../config/db.js";
import { subjects as subjectsTable, papers as papersTable, studyMaterials as studyMaterialsTable } from "../database/schema.js";

type TreeItem = { path: string; type: string; size?: number };

function repositoryDetails() {
	const url = new URL(env.pdfResourceBaseUrl);
	if (url.hostname !== "raw.githubusercontent.com") {
		throw new Error("PDF_RESOURCE_BASE_URL must be a raw.githubusercontent.com repository URL.");
	}
	const [owner, repository, branch, ...rootParts] = url.pathname.split("/").filter(Boolean);
	if (!owner || !repository || !branch || !rootParts.length) throw new Error("PDF_RESOURCE_BASE_URL is incomplete.");
	return { owner, repository, branch, root: rootParts.join("/") };
}

function publicUrl(relativePath: string) {
	return `${env.pdfResourceBaseUrl}/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
}

function subjectCode(folder: string) {
	return folder.replace(/_/g, "-").toUpperCase();
}

function subjectTitle(code: string) {
	return `${code} Study Material and Question Bank`;
}

function titleFromFile(filePath: string) {
	const base = path.posix.basename(filePath, ".pdf");
	return base.replace(/[-_]+/g, " ").replace(/\s+hi$/i, "").trim();
}

function sessionFromFile(filePath: string) {
	const base = path.posix.basename(filePath, ".pdf");
	const match = base.match(/(june|december|dec|jun)[-_ ]?(\d{4})/i);
	return match ? `${match[1].toLowerCase()} ${match[2]}` : "General";
}

export async function syncGitHubContent() {
	const repository = repositoryDetails();
	const apiUrl = `https://api.github.com/repos/${repository.owner}/${repository.repository}/git/trees/${repository.branch}?recursive=1`;
	const response = await fetch(apiUrl, {
		headers: {
			"User-Agent": "gyanpath-content-sync",
			Accept: "application/vnd.github.v3+json",
			...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
		}
	});
	if (!response.ok) {
		throw new Error(`GitHub API request failed with status ${response.status}: ${await response.text()}`);
	}
	const data = (await response.json()) as { tree: TreeItem[] };
	const prefix = `${repository.root}/`;
	const files = data.tree.filter(
		(item) => item.type === "blob" && item.path.startsWith(prefix) && item.path.endsWith(".pdf")
	);
	const grouped = new Map<string, { semester: number; folder: string; exam: TreeItem[]; study: TreeItem[] }>();
	for (const item of files) {
		const relative = item.path.slice(prefix.length);
		const match = relative.match(/^semester_(\d+)\/([^/]+)\/(exam_papers|study_material)\/(.+)$/i);
		if (!match) continue;
		const [, sem, folder, category] = match;
		const key = `${sem}:${folder.toLowerCase()}`;
		if (!grouped.has(key)) {
			grouped.set(key, { semester: Number(sem), folder, exam: [], study: [] });
		}
		const bucket = grouped.get(key)!;
		if (category.toLowerCase() === "exam_papers") bucket.exam.push(item);
		else bucket.study.push(item);
	}
	let subjects = 0;
	let papers = 0;
	let studyMaterials = 0;
	const syncedSubjectFolders: string[] = [];
	const syncedPaperPaths: string[] = [];
	const syncedStudyPaths: string[] = [];
	const now = new Date().toISOString();

	for (const group of grouped.values()) {
		const code = subjectCode(group.folder);
		const folderPath = `MCA_new/Semester_${group.semester}/${group.folder}`;
		syncedSubjectFolders.push(folderPath);

		const existingSub = await db.select().from(subjectsTable).where(eq(subjectsTable.code, code));
		let subjectId = existingSub[0]?.id;
		if (subjectId) {
			await db.update(subjectsTable).set({ semester: group.semester, folderPath, updatedAt: now }).where(eq(subjectsTable.id, subjectId));
		} else {
			subjectId = randomUUID();
			await db.insert(subjectsTable).values({
				id: subjectId,
				code,
				title: subjectTitle(code),
				semester: group.semester,
				type: code.startsWith("MCSL") ? "practical" : "theory",
				folderPath,
				questionBank: false,
				createdAt: now,
				updatedAt: now
			});
		}
		subjects++;

		const examLookup = new Map(group.exam.map((item) => [item.path.toLowerCase(), item]));
		for (const item of group.exam.filter((file) => !/-hi\.pdf$/i.test(file.path))) {
			const englishPath = publicUrl(item.path);
			syncedPaperPaths.push(englishPath);
			const hindi = examLookup.get(item.path.replace(/\.pdf$/i, "-hi.pdf").toLowerCase());
			const existingPaper = await db.select().from(papersTable).where(
				and(eq(papersTable.subjectId, subjectId), eq(papersTable.englishPath, englishPath))
			);
			if (existingPaper[0]) {
				await db.update(papersTable).set({
					hindiPath: hindi ? publicUrl(hindi.path) : null,
					fileSize: item.size || null,
					updatedAt: now
				}).where(eq(papersTable.id, existingPaper[0].id));
			} else {
				await db.insert(papersTable).values({
					id: randomUUID(),
					subjectId,
					title: titleFromFile(item.path),
					session: sessionFromFile(item.path),
					fileName: path.posix.basename(item.path),
					englishPath,
					hindiPath: hindi ? publicUrl(hindi.path) : null,
					fileSize: item.size || null,
					createdAt: now,
					updatedAt: now
				});
			}
			papers++;
		}

		const studyLookup = new Map(group.study.map((item) => [item.path.toLowerCase(), item]));
		for (const item of group.study.filter((file) => !/-hi\.pdf$/i.test(file.path))) {
			const filePath = publicUrl(item.path);
			syncedStudyPaths.push(filePath);
			const hindi = studyLookup.get(item.path.replace(/\.pdf$/i, "-hi.pdf").toLowerCase());
			const relativeParts = item.path.split("/");
			const groupName = relativeParts.length > 4 ? relativeParts[3].replace(/[_-]+/g, " ") : "Study Material";
			const existingMaterial = await db.select().from(studyMaterialsTable).where(eq(studyMaterialsTable.filePath, filePath));
			if (existingMaterial[0]) {
				await db.update(studyMaterialsTable).set({
					subjectId,
					groupName,
					title: titleFromFile(item.path),
					hindiPath: hindi ? publicUrl(hindi.path) : null
				}).where(eq(studyMaterialsTable.id, existingMaterial[0].id));
			} else {
				await db.insert(studyMaterialsTable).values({
					id: randomUUID(),
					subjectId,
					groupName,
					title: titleFromFile(item.path),
					filePath,
					hindiPath: hindi ? publicUrl(hindi.path) : null,
					createdAt: now
				});
			}
			studyMaterials++;
		}
	}

	return {
		semesters: new Set([...grouped.values()].map((group) => group.semester)).size,
		subjects,
		papers,
		studyMaterials,
		scannedFiles: files.length,
		repository: `${repository.owner}/${repository.repository}`
	};
}

const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedFile === fileURLToPath(import.meta.url)) {
	syncGitHubContent()
		.then((result) => console.log(`GitHub content sync completed: ${JSON.stringify(result)}`))
		.catch((error) => { console.error(error); process.exitCode = 1; });
}
