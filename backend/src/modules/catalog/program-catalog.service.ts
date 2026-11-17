import { existsSync, readdirSync, statSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { asc, eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { env } from "../../config/env.js";
import {
	programs,
	semesters,
	subjects,
	studyMaterials,
	papers
} from "../../infrastructure/database/schema.js";
import { contentSetup } from "../../config/content.setup.js";

export type ProgramInfo = {
	id: string;
	code: string;
	title: string;
	totalSemesters: number;
	folderName: string;
	active: boolean;
};

export type SubjectCardInfo = {
	code: string;
	name: string;
	type: string;
	semester: number;
	folderPath: string;
	questionPaperCount: number;
	galleryPage: string;
	htmlViewer: string;
	questionBank: string;
	studyGroups: Array<{ title: string; files: Array<{ title: string; path: string }> }>;
};

export type SemesterInfo = {
	number: number;
	folder: string;
	subjects: SubjectCardInfo[];
};

export type ResourceCollectionItem = {
	title: string;
	group: string;
	path: string;
	fileName: string;
	size: number;
	updated: string;
};

const DEFAULT_PROGRAM_CODE = "MCA_NEW";

function shortMonth(month: string) {
	return month.toLowerCase().startsWith("dec") ? "Dec" : "June";
}

function sessionFromName(name: string) {
	const monthYear = name.match(/\b(June|December|Dec)\s+(\d{4})\b/i);
	if (monthYear) return `${monthYear[2]} ${shortMonth(monthYear[1])}`;
	const yearMonth = name.match(/\b(\d{4})\s+(June|December|Dec)\b/i);
	if (yearMonth) return `${yearMonth[1]} ${shortMonth(yearMonth[2])}`;
	const set = name.match(/\bSet[-\s]*(\d+)\b/i);
	return set ? `Set ${set[1]}` : "Question Paper";
}

function titleFromFile(file: string) {
	return path.parse(file).name
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function formatUpdated(date: Date) {
	return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function filesInDir(folder: string, extension: string, recursive = false): string[] {
	if (!existsSync(folder)) return [];
	const result: string[] = [];
	for (const entry of readdirSync(folder, { withFileTypes: true })) {
		const item = path.join(folder, entry.name);
		if (entry.isDirectory() && recursive) result.push(...filesInDir(item, extension, true));
		else if (entry.isFile() && entry.name.toLowerCase().endsWith(extension)) result.push(item);
	}
	return result;
}

function dirsInDir(folder: string): string[] {
	if (!existsSync(folder)) return [];
	return readdirSync(folder, { withFileTypes: true })
		.filter((e) => e.isDirectory())
		.map((e) => path.join(folder, e.name));
}

export class ProgramCatalogService {
	private fallbackPreview = "/assets/images/fallback_images/pdf-preview-fallback.svg";

	/**
	 * Returns all available programs.
	 */
	async getPrograms(): Promise<ProgramInfo[]> {
		const rows = await db.select().from(programs).where(eq(programs.active, true));
		if (rows.length) {
			return rows.map((r) => ({
				id: r.id,
				code: r.code,
				title: r.title,
				totalSemesters: r.totalSemesters,
				folderName: r.folderName,
				active: r.active
			}));
		}

		// Fallback bootstrap program
		return [{
			id: "mca_new",
			code: contentSetup.program.code,
			title: contentSetup.program.title,
			totalSemesters: 4,
			folderName: contentSetup.folders.contentRoot,
			active: true
		}];
	}

	/**
	 * Resolves a program by code or id, defaulting to MCA_NEW.
	 */
	async getProgram(codeOrId?: string): Promise<ProgramInfo> {
		const all = await this.getPrograms();
		if (!codeOrId) {
			return all.find((p) => p.code.toUpperCase() === DEFAULT_PROGRAM_CODE) || all[0];
		}
		const normalized = codeOrId.trim().toUpperCase();
		const matched = all.find((p) => p.code.toUpperCase() === normalized || p.id.toUpperCase() === normalized);
		return matched || all[0];
	}

	/**
	 * Returns semesters and subjects for a given program.
	 */
	async getSemesters(programCodeOrId?: string): Promise<SemesterInfo[]> {
		const program = await this.getProgram(programCodeOrId);
		const programSubjects = await db.select().from(subjects)
			.where(program.id ? eq(subjects.programId, program.id) : undefined)
			.orderBy(asc(subjects.semester), asc(subjects.code));

		const allMaterials = await db.select().from(studyMaterials);
		const allPapers = await db.select().from(papers);

		// Group materials by subjectId
		const materialsBySubject = new Map<string, Array<{ groupName: string; title: string; filePath: string }>>();
		for (const m of allMaterials) {
			const list = materialsBySubject.get(m.subjectId) || [];
			list.push({ groupName: m.groupName, title: m.title, filePath: m.filePath });
			materialsBySubject.set(m.subjectId, list);
		}

		// Group paper count by subjectId
		const paperCountBySubject = new Map<string, number>();
		for (const p of allPapers) {
			paperCountBySubject.set(p.subjectId, (paperCountBySubject.get(p.subjectId) || 0) + 1);
		}

		const semestersMap = new Map<number, SubjectCardInfo[]>();

		for (const s of programSubjects) {
			const mList = materialsBySubject.get(s.id) || [];
			const groupsMap = new Map<string, Array<{ title: string; path: string }>>();
			for (const m of mList) {
				const groupFiles = groupsMap.get(m.groupName) || [];
				groupFiles.push({ title: m.title, path: m.filePath });
				groupsMap.set(m.groupName, groupFiles);
			}

			const paperCount = paperCountBySubject.get(s.id) || 0;
			const subjectCard: SubjectCardInfo = {
				code: s.code,
				name: s.title,
				type: s.type,
				semester: s.semester,
				folderPath: s.folderPath,
				questionPaperCount: paperCount,
				galleryPage: paperCount ? `/paper-gallery?subject=${encodeURIComponent(s.code)}` : "",
				htmlViewer: s.htmlViewerPath || "",
				questionBank: s.questionBank ? `/question-bank?subject=${encodeURIComponent(s.folderPath)}` : "",
				studyGroups: [...groupsMap].map(([title, files]) => ({ title, files }))
			};

			const list = semestersMap.get(s.semester) || [];
			list.push(subjectCard);
			semestersMap.set(s.semester, list);
		}

		return [...semestersMap.entries()]
			.sort(([a], [b]) => a - b)
			.map(([number, semSubjects]) => ({
				number,
				folder: `Semester_${number}`,
				subjects: semSubjects
			}));
	}

	/**
	 * Returns question papers for a subject or program.
	 */
	async getPapers(subjectCode?: string): Promise<any[]> {
		const allSubjects = await db.select().from(subjects);
		const subjectLookup = new Map(allSubjects.map((s) => [s.id, s.code]));

		const paperRows = subjectCode
			? await db.select().from(papers).where(eq(papers.subjectId, allSubjects.find((s) => s.code === subjectCode)?.id || ""))
			: await db.select().from(papers);

		return paperRows.map((p) => ({
			id: p.id,
			title: p.title,
			subject: subjectLookup.get(p.subjectId) || "",
			session: p.session,
			english: p.englishPath,
			hindi: p.hindiPath || "",
			preview: p.previewPath || this.fallbackPreview,
			fileName: p.fileName,
			pages: p.pageCount,
			size: p.fileSize,
			updated: formatUpdated(new Date(p.updatedAt))
		}));
	}

	/**
	 * Returns program guide and assignments collections.
	 */
	async getResourceCollections(programFolder = "MCA_new"): Promise<{ programGuide: ResourceCollectionItem[]; assignments: ResourceCollectionItem[] }> {
		const programDir = path.join(env.localResourcesRoot, programFolder);

		const scanFolder = (folderName: string): ResourceCollectionItem[] => {
			const folderPath = path.join(programDir, folderName);
			if (!existsSync(folderPath)) return [];
			return filesInDir(folderPath, ".pdf", true).map((file) => {
				const stat = statSync(file);
				const relPath = path.relative(env.localResourcesRoot, file).split(path.sep).join("/");
				const relGroup = path.relative(folderPath, path.dirname(file)).split(path.sep).filter(Boolean).join(" / ");
				return {
					title: titleFromFile(file),
					group: relGroup,
					path: `/local-resources/${relPath}`,
					fileName: path.basename(file),
					size: stat.size,
					updated: formatUpdated(stat.mtime)
				};
			}).sort((a, b) => a.title.localeCompare(b.title));
		};

		return {
			programGuide: scanFolder("program_guide"),
			assignments: scanFolder("assignments")
		};
	}

	/**
	 * Single consolidated method providing all data needed for the /resources page.
	 */
	async getResourcesPageData(programCodeOrId?: string) {
		const program = await this.getProgram(programCodeOrId);
		const [availablePrograms, semesters, papersList, collections] = await Promise.all([
			this.getPrograms(),
			this.getSemesters(program.code),
			this.getPapers(),
			this.getResourceCollections(program.folderName)
		]);

		const paperSessionsBySubject: Record<string, string[]> = {};
		for (const paper of papersList) {
			const sessions = paperSessionsBySubject[paper.subject] || [];
			if (paper.session && !sessions.includes(paper.session)) sessions.push(paper.session);
			paperSessionsBySubject[paper.subject] = sessions;
		}

		return {
			activeProgram: program,
			availablePrograms,
			semesters,
			paperSessionsBySubject,
			collections
		};
	}

	/**
	 * Master synchronizer: scans `local-resources/<folderName>` and synchronizes
	 * Program, Semester, Subject, StudyMaterial, and Paper into the SQLite database.
	 */
	async syncProgramFromDisk(programCode = "MCA_NEW", programTitle = "Master of Computer Applications", folderName = "MCA_new") {
		const programId = programCode.toLowerCase().replace(/[^a-z0-9]+/g, "_");
		const now = new Date().toISOString();
		const programRoot = path.join(env.localResourcesRoot, folderName);

		if (!existsSync(programRoot)) {
			throw new Error(`Program directory does not exist: ${programRoot}`);
		}

		// 1. Upsert Program
		const existingProg = await db.select().from(programs).where(eq(programs.code, programCode));
		if (existingProg[0]) {
			await db.update(programs).set({
				title: programTitle,
				folderName,
				updatedAt: now
			}).where(eq(programs.id, existingProg[0].id));
		} else {
			await db.insert(programs).values({
				id: programId,
				code: programCode,
				title: programTitle,
				totalSemesters: 4,
				folderName,
				active: true,
				createdAt: now,
				updatedAt: now
			});
		}

		// 2. Discover Semesters from local-resources/<folderName>/Semester_<N>
		const semesterDirs = dirsInDir(programRoot)
			.filter((d) => /^Semester_\d+$/i.test(path.basename(d)))
			.sort((a, b) => {
				const numA = Number(path.basename(a).match(/\d+/)?.[0] || 0);
				const numB = Number(path.basename(b).match(/\d+/)?.[0] || 0);
				return numA - numB;
			});

		// Build map of subject names from contentSetup
		const knownNames = new Map<string, string>(
			contentSetup.semesters.flatMap((s) => s.subjects.map((sub) => [sub.code.toUpperCase(), sub.title]))
		);

		for (const semDir of semesterDirs) {
			const semNumber = Number(path.basename(semDir).match(/\d+/)?.[0] || 0);
			const semId = `${programId}_sem_${semNumber}`;

			// Upsert Semester
			const existingSem = await db.select().from(semesters)
				.where(eq(semesters.id, semId));
			if (!existingSem[0]) {
				await db.insert(semesters).values({
					id: semId,
					programId,
					number: semNumber,
					title: `Semester ${semNumber}`,
					active: true,
					status: "PUBLISHED",
					createdAt: now,
					updatedAt: now
				});
			}

			// Discover Subjects
			const subjectDirs = dirsInDir(semDir);
			for (const subDir of subjectDirs) {
				const rawFolder = path.basename(subDir);
				const code = rawFolder.replaceAll("_", "-").toUpperCase();
				const title = knownNames.get(code) || titleFromFile(rawFolder);
				const type = code.startsWith("MCSL") || code.includes("LAB") ? "practical" : (code.includes("PROJECT") ? "project" : "theory");

				const relativeSubject = `${folderName}/${path.basename(semDir)}/${rawFolder}`;
				const examDir = path.join(subDir, "exam_papers");
				const studyDir = path.join(subDir, "study_material");

				// Check for HTML viewer
				const htmlFiles = filesInDir(examDir, ".html").filter((f) => path.basename(f).toLowerCase() !== "index.html");
				const htmlViewerPath = htmlFiles[0]
					? `/assets/resources/${folderName}/${path.basename(semDir)}/${rawFolder}/exam_papers/${path.basename(htmlFiles[0])}`
					: null;

				const hasQuestionBank = existsSync(path.join(env.frontendRoot, "assets", "resources", folderName, path.basename(semDir), rawFolder, "data", "manifest.json"));

				// Upsert Subject
				const existingSub = await db.select().from(subjects).where(eq(subjects.code, code));
				let subjectId = existingSub[0]?.id;
				const subPayload = {
					programId,
					code,
					title,
					semester: semNumber,
					type,
					folderPath: relativeSubject,
					htmlViewerPath,
					questionBank: hasQuestionBank,
					updatedAt: now
				};

				if (subjectId) {
					await db.update(subjects).set(subPayload).where(eq(subjects.id, subjectId));
				} else {
					subjectId = randomUUID();
					await db.insert(subjects).values({ id: subjectId, ...subPayload, createdAt: now });
				}

				// 3. Upsert Study Materials
				if (existsSync(studyDir)) {
					await db.delete(studyMaterials).where(eq(studyMaterials.subjectId, subjectId));
					const studyPdfs = filesInDir(studyDir, ".pdf", true);
					for (const pdf of studyPdfs) {
						const parent = path.relative(studyDir, path.dirname(pdf)).split(path.sep).filter(Boolean).join(" / ") || "Study Material";
						const relToLocal = path.relative(env.localResourcesRoot, pdf).split(path.sep).join("/");
						await db.insert(studyMaterials).values({
							id: randomUUID(),
							subjectId,
							groupName: parent,
							title: path.parse(pdf).name,
							filePath: `/local-resources/${relToLocal}`,
							status: "PUBLISHED",
							createdAt: now
						});
					}
				}

				// 4. Upsert Papers
				if (existsSync(examDir)) {
					await db.delete(papers).where(eq(papers.subjectId, subjectId));
					const allExamPdfs = filesInDir(examDir, ".pdf");
					const hindiMap = new Map<string, string>();

					for (const f of allExamPdfs.filter((p) => path.parse(p).name.toLowerCase().endsWith("-hi"))) {
						const baseName = path.parse(f).name.replace(/-hi$/i, "").toLowerCase();
						hindiMap.set(baseName, f);
					}

					for (const english of allExamPdfs.filter((p) => !path.parse(p).name.toLowerCase().endsWith("-hi"))) {
						const parsed = path.parse(english);
						const hindi = hindiMap.get(parsed.name.toLowerCase());
						const stat = statSync(english);
						const relEnglish = path.relative(env.localResourcesRoot, english).split(path.sep).join("/");
						const relHindi = hindi ? path.relative(env.localResourcesRoot, hindi).split(path.sep).join("/") : null;

						await db.insert(papers).values({
							id: randomUUID(),
							subjectId,
							title: parsed.name.replace(/\bquestion\s+paper\b/i, "").replace(/\s+/g, " ").trim(),
							session: sessionFromName(parsed.name),
							fileName: parsed.base,
							englishPath: `/local-resources/${relEnglish}`,
							hindiPath: relHindi ? `/local-resources/${relHindi}` : null,
							previewPath: this.fallbackPreview,
							fileSize: stat.size,
							status: "PUBLISHED",
							createdAt: now,
							updatedAt: now
						});
					}
				}
			}
		}

		return {
			programCode,
			semestersCount: semesterDirs.length
		};
	}
}

export const programCatalogService = new ProgramCatalogService();
