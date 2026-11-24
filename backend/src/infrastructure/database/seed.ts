import bcrypt from "bcryptjs";
import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import {
	programs,
	semesters,
	users,
	subjects,
	studyMaterials,
	papers,
	questions,
	answers,
	banners,
	contributors
} from "./schema.js";
import { programCatalogService } from "../../modules/catalog/program-catalog.service.js";
import { storageService } from "../storage/storage.service.js";
import { env } from "../../config/env.js";

const UserRole = { ADMIN: "ADMIN", EDITOR: "EDITOR", USER: "USER" } as const;
const QuestionStatus = { PENDING: "PENDING", PUBLISHED: "PUBLISHED" } as const;

function questionFile(subjectFolder: string, fileName: string) {
	return path.join(
		storageService.resourcesRoot,
		subjectFolder,
		"data",
		fileName
	);
}

async function seedUsers() {
	const userList = [
		["admin", "admin123", "Administrator", UserRole.ADMIN],
		["editor", "editor123", "Content Editor", UserRole.EDITOR],
		["user", "user123", "Student User", UserRole.USER]
	] as const;

	const now = new Date().toISOString();
	for (const [username, password, displayName, role] of userList) {
		const existing = await db.select().from(users).where(eq(users.username, username));
		if (existing[0]) {
			await db.update(users).set({ displayName, role, status: "ACTIVE", updatedAt: now }).where(eq(users.id, existing[0].id));
		} else {
			await db.insert(users).values({
				id: randomUUID(),
				username,
				displayName,
				role,
				status: "ACTIVE",
				passwordHash: await bcrypt.hash(password, 12),
				createdAt: now,
				updatedAt: now
			});
		}
	}
}

async function seedCatalog() {
	console.log("Synchronizing program catalog from local-resources...");
	await programCatalogService.syncProgramFromDisk("MCA_NEW", "Master of Computer Applications", "MCA_new");

	// Seed secondary program (BCA_NEW) for multi-program demo & support
	const bcaProgram = {
		id: "bca_new",
		code: "BCA_NEW",
		title: "Bachelor of Computer Applications",
		totalSemesters: 6,
		folderName: "BCA_new",
		active: true
	};

	const now = new Date().toISOString();
	const existingBca = await db.select().from(programs).where(eq(programs.code, bcaProgram.code));
	if (!existingBca[0]) {
		await db.insert(programs).values({
			...bcaProgram,
			createdAt: now,
			updatedAt: now
		});
	}

	const sem1Id = "bca_new_sem_1";
	const existingSem = await db.select().from(semesters).where(eq(semesters.id, sem1Id));
	if (!existingSem[0]) {
		await db.insert(semesters).values({
			id: sem1Id,
			programId: bcaProgram.id,
			number: 1,
			title: "Semester 1",
			active: true,
			status: "PUBLISHED",
			createdAt: now,
			updatedAt: now
		});
	}

	const bcaSubjects = [
		{
			id: "bca_new_bcs_011",
			programId: bcaProgram.id,
			code: "BCS-011",
			title: "Computer Basics and PC Software",
			semester: 1,
			type: "theory",
			credits: 3,
			folderPath: "BCA_new/Semester_1/bcs_011",
			questionBank: false
		},
		{
			id: "bca_new_bcsl_013",
			programId: bcaProgram.id,
			code: "BCSL-013",
			title: "Computer Basics and PC Software Lab",
			semester: 1,
			type: "practical",
			credits: 2,
			folderPath: "BCA_new/Semester_1/bcsl_013",
			questionBank: false
		}
	];

	for (const sub of bcaSubjects) {
		const existingSub = await db.select().from(subjects).where(eq(subjects.id, sub.id));
		if (!existingSub[0]) {
			await db.insert(subjects).values({
				...sub,
				createdAt: now,
				updatedAt: now
			});
		}
	}


	// Seed question banks for subjects that have them
	const allSubjects = await db.select().from(subjects);
	for (const sub of allSubjects) {
		if (sub.questionBank) {
			await seedQuestions(sub.id, sub.folderPath);
		}
	}
	console.log(`Program catalog synchronized successfully. Total subjects: ${allSubjects.length}`);
}

async function seedQuestions(subjectId: string, subjectFolder: string) {
	const manifestPath = questionFile(subjectFolder, "manifest.json");
	if (!existsSync(manifestPath)) return;
	const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
	const now = new Date().toISOString();

	for (const meta of manifest.questions || []) {
		const contentPath = questionFile(subjectFolder, meta.file);
		const hasContent = existsSync(contentPath);
		const content = hasContent ? JSON.parse(readFileSync(contentPath, "utf8")) : null;

		const qData = {
			subjectId,
			sourceFile: meta.file,
			title: meta.title || meta.id,
			questionMd: content?.question?.markdown || null,
			category: meta.classification?.chapterTitle || null,
			difficulty: meta.difficulty || null,
			marks: meta.marks ?? null,
			tags: meta.tags || [],
			appearedIn: meta.appearedIn || [],
			relatedData: {
				classification: meta.classification || null,
				groupId: meta.groupId || null
			},
			media: content?.media || [],
			contentStatus: hasContent ? QuestionStatus.PUBLISHED : QuestionStatus.PENDING,
			updatedAt: now
		};

		await db.insert(questions)
			.values({ id: meta.id, ...qData, createdAt: now })
			.onConflictDoUpdate({
				target: questions.id,
				set: qData
			});

		if (content?.answers) {
			for (const [language, modes] of Object.entries(content.answers)) {
				for (const [mode, answer] of Object.entries(modes as Record<string, string>)) {
					const answerContent = String(answer);
					const existingAns = await db.select().from(answers).where(
						eq(answers.questionId, meta.id)
					).then((rows) => rows.find((r) => r.language === language && r.mode === mode));

					if (existingAns) {
						await db.update(answers).set({ content: answerContent }).where(eq(answers.id, existingAns.id));
					} else {
						await db.insert(answers).values({
							id: randomUUID(),
							questionId: meta.id,
							language,
							mode,
							content: answerContent
						});
					}
				}
			}
		}
	}
}

async function seedContent() {
	const defaultBanners = [
		{
			title: "Prepare Smarter for Your MCA Exams",
			description: "Open previous-year papers, important questions and study material from one place.",
			category: "Exam",
			image: "/assets/images/fallback_images/banner-exam.svg",
			buttonText: "Explore Resources",
			buttonUrl: "#semesterContainer",
			priority: 1
		},
		{
			title: "Date Sheet & Exam Updates",
			description: "Publish important exam schedules and deadline announcements here.",
			category: "Date Sheet",
			image: "../assets/images/banner-datesheet.svg",
			buttonText: "View Notice",
			buttonUrl: "#semesterContainer",
			priority: 2
		},
		{
			title: "Exam Permission & Hall Ticket",
			description: "Check examination permission, hall-ticket and important eligibility notices.",
			category: "Permission",
			image: "../assets/images/banner-permission.svg",
			buttonText: "Check Updates",
			buttonUrl: "#semesterContainer",
			priority: 3
		}
	];

	const now = new Date().toISOString();
	for (const item of defaultBanners) {
		const existing = await db.select().from(banners).where(eq(banners.title, item.title));
		if (!existing[0]) {
			await db.insert(banners).values({
				id: randomUUID(),
				...item,
				createdAt: now,
				updatedAt: now
			});
		}
	}

	const existingContrib = await db.select().from(contributors).where(eq(contributors.id, "rajaanha"));
	if (!existingContrib[0]) {
		await db.insert(contributors).values({
			id: "rajaanha",
			name: "Rajaanha",
			info: "Developer and maintainer of the MCA Study Helper.",
			avatar: "/assets/images/contributors/rajaanha-guinea-pig.webp",
			contributions: [
				"Designed and developed the study helper",
				"Organized semester-wise study resources"
			],
			createdAt: now,
			updatedAt: now
		});
	}
}

async function main() {
	await seedUsers();
	await seedCatalog();
	await seedContent();
}

main()
	.then(() => console.log("Database seed completed."))
	.catch((err) => {
		console.error("Seed error:", err);
		process.exit(1);
	});
