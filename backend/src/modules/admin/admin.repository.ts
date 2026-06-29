import type { UserRole } from "../../domain/auth/roles.js";
import { prisma } from "../../config/prisma.js";

const backupDelegates: Record<string, string> = {
	users: "user", semesters: "semester", subjects: "subject", sessions: "session",
	studyMaterials: "studyMaterial", papers: "paper", questions: "question", answers: "answer",
	progress: "progress", notes: "note", banners: "banner", lectures: "lecture",
	contributors: "contributor", discussions: "discussion", comments: "comment",
	appSettings: "appSetting", assignments: "assignment", reports: "report",
	fileAssets: "fileAsset", auditLogs: "auditLog", analyticsVisits: "analyticsVisit", feedback: "feedback"
};

export const adminRepository = {
	async exportAllModels() {
		const entries = await Promise.all(Object.entries(backupDelegates).map(async ([name, delegate]) => [
			name,
			await (prisma as any)[delegate].findMany()
		] as const));
		return Object.fromEntries(entries) as Record<string, any[]>;
	},
	backupModelRows(model: string) {
		const delegate = backupDelegates[model];
		if (!delegate) throw new Error(`Unknown backup model: ${model}`);
		return (prisma as any)[delegate].findMany() as Promise<any[]>;
	},
	async backupRowExists(model: string, where: any) {
		const delegate = backupDelegates[model];
		if (!delegate) return false;
		return Boolean(await (prisma as any)[delegate].findUnique({ where }));
	},
	backupRowWrite(model: string, row: any, where: any, exists: boolean) {
		const delegate = backupDelegates[model];
		if (!delegate) throw new Error(`Unknown backup model: ${model}`);
		return exists
			? (prisma as any)[delegate].update({ where, data: row })
			: (prisma as any)[delegate].create({ data: row });
	},
	replaceAllModels(models: Record<string, any[]>) {
		return prisma.$transaction(async (tx) => {
			const reverse = Object.entries(backupDelegates).reverse();
			for (const [, delegate] of reverse) await (tx as any)[delegate].deleteMany();
			for (const [name, delegate] of Object.entries(backupDelegates)) {
				if (models[name]?.length) await (tx as any)[delegate].createMany({ data: models[name] });
			}
		});
	},
	createAuditLog(data: { actorId: string | null; action: string; entityType: string; entityId?: string; details?: unknown }) {
		return prisma.auditLog.create({ data: data as never });
	},
	setting(key: string) {
		return prisma.appSetting.findUnique({ where: { key } });
	},
	saveSetting(key: string, value: unknown) {
		return prisma.appSetting.upsert({ where: { key }, update: { value: value as never }, create: { key, value: value as never } });
	},
	deleteSetting(key: string) {
		return prisma.appSetting.deleteMany({ where: { key } });
	},
	createFileAsset(data: { originalName: string; storedName: string; mimeType: string; size: number; path: string; category: string; uploadedById: string }) {
		return prisma.fileAsset.create({ data });
	},
	settingsForUploadNormalization() {
		return Promise.all([
			prisma.appSetting.findMany(),
			prisma.banner.findMany(),
			prisma.contributor.findMany(),
			prisma.fileAsset.findMany({ where: { path: { startsWith: "/uploads/settings/" } } })
		]);
	},
	saveSubject(id: string | undefined, data: any) {
		const select = { id: true, code: true, title: true, semester: true, type: true };
		return id ? prisma.subject.update({ where: { id }, data, select }) : prisma.subject.create({ data, select });
	},
	deleteSubject(id: string) { return prisma.subject.delete({ where: { id } }); },
	updateUserStatus(id: string, status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BANNED") {
		return prisma.user.update({ where: { id }, data: { status }, select: { id: true, username: true, displayName: true, role: true, status: true } });
	},
	semesters() { return prisma.semester.findMany({ orderBy: { number: "asc" } }); },
	saveSemester(id: string | undefined, data: any) { return id ? prisma.semester.update({ where: { id }, data }) : prisma.semester.create({ data }); },
	deleteSemester(id: string) { return prisma.semester.delete({ where: { id } }); },
	assignments() { return prisma.assignment.findMany({ include: { subject: { select: { code: true, title: true } }, createdBy: { select: { displayName: true } } }, orderBy: { createdAt: "desc" } }); },
	saveAssignment(id: string | undefined, data: any, createdById: string) { return id ? prisma.assignment.update({ where: { id }, data }) : prisma.assignment.create({ data: { ...data, createdById } }); },
	deleteAssignment(id: string) { return prisma.assignment.delete({ where: { id } }); },
	studyMaterials() { return prisma.studyMaterial.findMany({ include: { subject: { select: { code: true, title: true, semester: true } } }, orderBy: [{ subject: { semester: "asc" } }, { subject: { code: "asc" } }, { groupName: "asc" }, { title: "asc" }] }); },
	saveStudyMaterial(id: string | undefined, data: any) { return id ? prisma.studyMaterial.update({ where: { id }, data }) : prisma.studyMaterial.create({ data }); },
	deleteStudyMaterial(id: string) { return prisma.studyMaterial.delete({ where: { id } }); },
	papers() { return prisma.paper.findMany({ include: { subject: { select: { code: true, title: true, semester: true } } }, orderBy: [{ subject: { semester: "asc" } }, { subject: { code: "asc" } }, { session: "desc" }, { title: "asc" }] }); },
	savePaper(id: string | undefined, data: any) { return id ? prisma.paper.update({ where: { id }, data }) : prisma.paper.create({ data }); },
	deletePaper(id: string) { return prisma.paper.delete({ where: { id } }); },
	reports() { return prisma.report.findMany({ include: { reporter: { select: { username: true, displayName: true } }, reportedUser: { select: { username: true, displayName: true } } }, orderBy: { createdAt: "desc" } }); },
	reviewReport(id: string, data: any) { return prisma.report.update({ where: { id }, data }); },
	auditLogs() { return prisma.auditLog.findMany({ take: 200, include: { actor: { select: { username: true, displayName: true } } }, orderBy: { createdAt: "desc" } }); },
	async overview() {
		const [
			users,
			subjects,
			papers,
			studyMaterials,
			questions,
			discussions,
			comments,
			banners,
			lectures
		] = await prisma.$transaction([
			prisma.user.count(),
			prisma.subject.count(),
			prisma.paper.count(),
			prisma.studyMaterial.count(),
			prisma.question.count(),
			prisma.discussion.count(),
			prisma.comment.count(),
			prisma.banner.count(),
			prisma.lecture.count()
		]);

		return {
			users,
			subjects,
			papers,
			studyMaterials,
			questions,
			discussions,
			comments,
			banners,
			lectures
		};
	},
	users() {
		return prisma.user.findMany({
			select: {
				id: true,
				username: true,
				email: true,
				displayName: true,
				role: true,
				status: true,
				createdAt: true,
				analyticsVisits: {
					take: 1,
					orderBy: { createdAt: "desc" },
					select: { createdAt: true, pagePath: true, deviceType: true, browser: true }
				},
				_count: {
					select: {
						progress: true,
						discussions: true,
						comments: true,
						assignments: true,
						reportsMade: true,
						reportsAbout: true
					}
				}
			},
			orderBy: [{ role: "desc" }, { createdAt: "asc" }]
		});
	},
	subjects() {
		return prisma.subject.findMany({
			select: {
				id: true,
				code: true,
				title: true,
				semester: true,
				type: true,
				folderPath: true,
				htmlViewerPath: true,
				questionBank: true
			},
			orderBy: [{ semester: "asc" }, { code: "asc" }]
		});
	},
	findUser(id: string) {
		return prisma.user.findUnique({ where: { id } });
	},
	updateRole(id: string, role: UserRole) {
		return prisma.user.update({
			where: { id },
			data: { role },
			select: {
				id: true,
				username: true,
				displayName: true,
				email: true,
				role: true,
				createdAt: true
			}
		});
	},
	updateUser(id: string, data: { role: UserRole; status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BANNED" }) {
		return prisma.user.update({
			where: { id },
			data,
			select: {
				id: true,
				username: true,
				displayName: true,
				email: true,
				role: true,
				status: true,
				createdAt: true
			}
		});
	},
	updatePassword(id: string, passwordHash: string) {
		return prisma.user.update({
			where: { id },
			data: { passwordHash },
			select: { id: true, username: true, displayName: true }
		});
	},
	deleteUser(id: string) {
		return prisma.user.delete({
			where: { id },
			select: { id: true, username: true, displayName: true, role: true }
		});
	},
	adminCount() {
		return prisma.user.count({ where: { role: "ADMIN" } });
	},
	async analyticsRetention() {
		const setting = await prisma.appSetting.findUnique({
			where: { key: "analytics-retention" }
		});
		return setting?.value;
	},
	saveAnalyticsRetention(value: {
		enabled: boolean;
		retentionDays: 90 | 180;
		action: "delete" | "anonymize";
	}) {
		return prisma.appSetting.upsert({
			where: { key: "analytics-retention" },
			update: { value },
			create: { key: "analytics-retention", value }
		});
	}
};
