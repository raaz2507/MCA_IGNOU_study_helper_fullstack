import { randomUUID } from "node:crypto";
import { asc, desc, eq, sql } from "drizzle-orm";
import type { UserRole } from "../../domain/auth/roles.js";
import { db } from "../../config/db.js";
import * as schema from "../../infrastructure/database/schema.js";

const tables: Record<string, any> = {
	users: schema.users,
	semesters: schema.semesters,
	subjects: schema.subjects,
	sessions: schema.sessions,
	studyMaterials: schema.studyMaterials,
	papers: schema.papers,
	questions: schema.questions,
	answers: schema.answers,
	progress: schema.progress,
	notes: schema.notes,
	banners: schema.banners,
	lectures: schema.lectures,
	contributors: schema.contributors,
	discussions: schema.discussions,
	comments: schema.comments,
	appSettings: schema.appSettings,
	assignments: schema.assignments,
	reports: schema.reports,
	fileAssets: schema.fileAssets,
	auditLogs: schema.auditLogs,
	analyticsVisits: schema.analyticsVisits,
	feedback: schema.feedback
};

export const adminRepository = {
	async exportAllModels() {
		const entries = await Promise.all(
			Object.entries(tables).map(async ([name, table]) => [
				name,
				await db.select().from(table)
			] as const)
		);
		return Object.fromEntries(entries) as Record<string, any[]>;
	},

	backupModelRows(model: string) {
		const table = tables[model];
		if (!table) throw new Error(`Unknown backup model: ${model}`);
		return db.select().from(table);
	},

	async backupRowExists(model: string, where: any) {
		const table = tables[model];
		if (!table) return false;
		const key = Object.keys(where)[0];
		if (!key || !(key in table)) return false;
		const rows = await db.select().from(table).where(eq(table[key], where[key]));
		return Boolean(rows[0]);
	},

	async backupRowWrite(model: string, row: any, where: any, exists: boolean) {
		const table = tables[model];
		if (!table) throw new Error(`Unknown backup model: ${model}`);
		const key = Object.keys(where)[0];
		if (exists && key && key in table) {
			return db.update(table).set(row).where(eq(table[key], where[key]));
		}
		return db.insert(table).values(row);
	},

	async replaceAllModels(models: Record<string, any[]>) {
		return db.transaction(async (tx) => {
			const reverse = Object.entries(tables).reverse();
			for (const [, table] of reverse) {
				await tx.delete(table);
			}
			for (const [name, table] of Object.entries(tables)) {
				const rows = models[name];
				if (rows?.length) {
					for (const row of rows) {
						await tx.insert(table).values(row);
					}
				}
			}
		});
	},

	async createAuditLog(data: { actorId: string | null; action: string; entityType: string; entityId?: string; details?: unknown }) {
		const id = randomUUID();
		const now = new Date().toISOString();
		await db.insert(schema.auditLogs).values({
			id,
			actorId: data.actorId,
			action: data.action,
			entityType: data.entityType,
			entityId: data.entityId,
			details: data.details as any,
			createdAt: now
		});
		const rows = await db.select().from(schema.auditLogs).where(eq(schema.auditLogs.id, id));
		return rows[0];
	},

	async setting(key: string) {
		const rows = await db.select().from(schema.appSettings).where(eq(schema.appSettings.key, key));
		return rows[0] || null;
	},

	async saveSetting(key: string, value: unknown) {
		const now = new Date().toISOString();
		await db.insert(schema.appSettings)
			.values({ key, value: value as any, updatedAt: now })
			.onConflictDoUpdate({
				target: schema.appSettings.key,
				set: { value: value as any, updatedAt: now }
			});
		const rows = await db.select().from(schema.appSettings).where(eq(schema.appSettings.key, key));
		return rows[0];
	},

	async deleteSetting(key: string) {
		return db.delete(schema.appSettings).where(eq(schema.appSettings.key, key));
	},

	async createFileAsset(data: { originalName: string; storedName: string; mimeType: string; size: number; path: string; category: string; uploadedById: string }) {
		const id = randomUUID();
		const now = new Date().toISOString();
		await db.insert(schema.fileAssets).values({
			id,
			...data,
			createdAt: now
		});
		const rows = await db.select().from(schema.fileAssets).where(eq(schema.fileAssets.id, id));
		return rows[0];
	},

	async settingsForUploadNormalization() {
		return Promise.all([
			db.select().from(schema.appSettings),
			db.select().from(schema.banners),
			db.select().from(schema.contributors),
			db.select().from(schema.fileAssets)
		]);
	},

	async saveSubject(id: string | undefined, data: any) {
		const now = new Date().toISOString();
		const targetId = id || randomUUID();
		if (id) {
			await db.update(schema.subjects).set({ ...data, updatedAt: now }).where(eq(schema.subjects.id, id));
		} else {
			await db.insert(schema.subjects).values({ id: targetId, ...data, createdAt: now, updatedAt: now });
		}
		const rows = await db.select({
			id: schema.subjects.id,
			code: schema.subjects.code,
			title: schema.subjects.title,
			semester: schema.subjects.semester,
			type: schema.subjects.type
		}).from(schema.subjects).where(eq(schema.subjects.id, targetId));
		return rows[0];
	},

	async deleteSubject(id: string) {
		const rows = await db.select().from(schema.subjects).where(eq(schema.subjects.id, id));
		await db.delete(schema.subjects).where(eq(schema.subjects.id, id));
		return rows[0];
	},

	async updateUserStatus(id: string, status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BANNED") {
		const now = new Date().toISOString();
		await db.update(schema.users).set({ status, updatedAt: now }).where(eq(schema.users.id, id));
		const rows = await db.select({
			id: schema.users.id,
			username: schema.users.username,
			displayName: schema.users.displayName,
			role: schema.users.role,
			status: schema.users.status
		}).from(schema.users).where(eq(schema.users.id, id));
		return rows[0];
	},

	async semesters() {
		return db.select().from(schema.semesters).orderBy(asc(schema.semesters.number));
	},

	async saveSemester(id: string | undefined, data: any) {
		const now = new Date().toISOString();
		const targetId = id || randomUUID();
		if (id) {
			await db.update(schema.semesters).set({ ...data, updatedAt: now }).where(eq(schema.semesters.id, id));
		} else {
			await db.insert(schema.semesters).values({ id: targetId, ...data, createdAt: now, updatedAt: now });
		}
		const rows = await db.select().from(schema.semesters).where(eq(schema.semesters.id, targetId));
		return rows[0];
	},

	async deleteSemester(id: string) {
		const rows = await db.select().from(schema.semesters).where(eq(schema.semesters.id, id));
		await db.delete(schema.semesters).where(eq(schema.semesters.id, id));
		return rows[0];
	},

	async assignments() {
		const rows = await db.select({
			assignment: schema.assignments,
			subjectCode: schema.subjects.code,
			subjectTitle: schema.subjects.title,
			creatorDisplayName: schema.users.displayName
		})
		.from(schema.assignments)
		.innerJoin(schema.subjects, eq(schema.assignments.subjectId, schema.subjects.id))
		.innerJoin(schema.users, eq(schema.assignments.createdById, schema.users.id))
		.orderBy(desc(schema.assignments.createdAt));

		return rows.map((r) => ({
			...r.assignment,
			subject: { code: r.subjectCode, title: r.subjectTitle },
			createdBy: { displayName: r.creatorDisplayName }
		}));
	},

	async saveAssignment(id: string | undefined, data: any, createdById: string) {
		const now = new Date().toISOString();
		const targetId = id || randomUUID();
		if (id) {
			await db.update(schema.assignments).set({ ...data, updatedAt: now }).where(eq(schema.assignments.id, id));
		} else {
			await db.insert(schema.assignments).values({ id: targetId, ...data, createdById, createdAt: now, updatedAt: now });
		}
		const rows = await db.select().from(schema.assignments).where(eq(schema.assignments.id, targetId));
		return rows[0];
	},

	async deleteAssignment(id: string) {
		const rows = await db.select().from(schema.assignments).where(eq(schema.assignments.id, id));
		await db.delete(schema.assignments).where(eq(schema.assignments.id, id));
		return rows[0];
	},

	async studyMaterials() {
		const rows = await db.select({
			studyMaterial: schema.studyMaterials,
			subjectCode: schema.subjects.code,
			subjectTitle: schema.subjects.title,
			subjectSemester: schema.subjects.semester
		})
		.from(schema.studyMaterials)
		.innerJoin(schema.subjects, eq(schema.studyMaterials.subjectId, schema.subjects.id))
		.orderBy(
			asc(schema.subjects.semester),
			asc(schema.subjects.code),
			asc(schema.studyMaterials.groupName),
			asc(schema.studyMaterials.title)
		);

		return rows.map((r) => ({
			...r.studyMaterial,
			subject: { code: r.subjectCode, title: r.subjectTitle, semester: r.subjectSemester }
		}));
	},

	async saveStudyMaterial(id: string | undefined, data: any) {
		const targetId = id || randomUUID();
		const now = new Date().toISOString();
		if (id) {
			await db.update(schema.studyMaterials).set(data).where(eq(schema.studyMaterials.id, id));
		} else {
			await db.insert(schema.studyMaterials).values({ id: targetId, ...data, createdAt: now });
		}
		const rows = await db.select().from(schema.studyMaterials).where(eq(schema.studyMaterials.id, targetId));
		return rows[0];
	},

	async deleteStudyMaterial(id: string) {
		const rows = await db.select().from(schema.studyMaterials).where(eq(schema.studyMaterials.id, id));
		await db.delete(schema.studyMaterials).where(eq(schema.studyMaterials.id, id));
		return rows[0];
	},

	async papers() {
		const rows = await db.select({
			paper: schema.papers,
			subjectCode: schema.subjects.code,
			subjectTitle: schema.subjects.title,
			subjectSemester: schema.subjects.semester
		})
		.from(schema.papers)
		.innerJoin(schema.subjects, eq(schema.papers.subjectId, schema.subjects.id))
		.orderBy(
			asc(schema.subjects.semester),
			asc(schema.subjects.code),
			desc(schema.papers.session),
			asc(schema.papers.title)
		);

		return rows.map((r) => ({
			...r.paper,
			subject: { code: r.subjectCode, title: r.subjectTitle, semester: r.subjectSemester }
		}));
	},

	async savePaper(id: string | undefined, data: any) {
		const targetId = id || randomUUID();
		const now = new Date().toISOString();
		if (id) {
			await db.update(schema.papers).set({ ...data, updatedAt: now }).where(eq(schema.papers.id, id));
		} else {
			await db.insert(schema.papers).values({ id: targetId, ...data, createdAt: now, updatedAt: now });
		}
		const rows = await db.select().from(schema.papers).where(eq(schema.papers.id, targetId));
		return rows[0];
	},

	async deletePaper(id: string) {
		const rows = await db.select().from(schema.papers).where(eq(schema.papers.id, id));
		await db.delete(schema.papers).where(eq(schema.papers.id, id));
		return rows[0];
	},

	async reports() {
		const rows = await db.select().from(schema.reports).orderBy(desc(schema.reports.createdAt));
		const userIds = new Set<string>();
		for (const r of rows) {
			if (r.reporterId) userIds.add(r.reporterId);
			if (r.reportedUserId) userIds.add(r.reportedUserId);
		}

		const userMap = new Map<string, { username: string; displayName: string }>();
		if (userIds.size > 0) {
			const uRows = await db.select({
				id: schema.users.id,
				username: schema.users.username,
				displayName: schema.users.displayName
			}).from(schema.users);
			for (const u of uRows) userMap.set(u.id, u);
		}

		return rows.map((r) => ({
			...r,
			reporter: r.reporterId ? userMap.get(r.reporterId) || null : null,
			reportedUser: r.reportedUserId ? userMap.get(r.reportedUserId) || null : null
		}));
	},

	async reviewReport(id: string, data: any) {
		const now = new Date().toISOString();
		await db.update(schema.reports).set({ ...data, updatedAt: now }).where(eq(schema.reports.id, id));
		const rows = await db.select().from(schema.reports).where(eq(schema.reports.id, id));
		return rows[0];
	},

	async auditLogs() {
		const rows = await db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.createdAt)).limit(200);
		const actorIds = new Set(rows.map((r) => r.actorId).filter(Boolean) as string[]);
		const actorMap = new Map<string, { username: string; displayName: string }>();
		if (actorIds.size > 0) {
			const uRows = await db.select({
				id: schema.users.id,
				username: schema.users.username,
				displayName: schema.users.displayName
			}).from(schema.users);
			for (const u of uRows) actorMap.set(u.id, u);
		}
		return rows.map((r) => ({
			...r,
			actor: r.actorId ? actorMap.get(r.actorId) || null : null
		}));
	},

	async overview() {
		const countTable = async (table: any) => {
			const res = await db.select({ count: sql<number>`count(*)` }).from(table);
			return Number(res[0]?.count || 0);
		};

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
		] = await Promise.all([
			countTable(schema.users),
			countTable(schema.subjects),
			countTable(schema.papers),
			countTable(schema.studyMaterials),
			countTable(schema.questions),
			countTable(schema.discussions),
			countTable(schema.comments),
			countTable(schema.banners),
			countTable(schema.lectures)
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

	async users() {
		const allUsers = await db.select({
			id: schema.users.id,
			username: schema.users.username,
			email: schema.users.email,
			displayName: schema.users.displayName,
			role: schema.users.role,
			status: schema.users.status,
			createdAt: schema.users.createdAt
		})
		.from(schema.users)
		.orderBy(desc(schema.users.role), asc(schema.users.createdAt));

		const visits = await db.select({
			userId: schema.analyticsVisits.userId,
			createdAt: schema.analyticsVisits.createdAt,
			pagePath: schema.analyticsVisits.pagePath,
			deviceType: schema.analyticsVisits.deviceType,
			browser: schema.analyticsVisits.browser
		})
		.from(schema.analyticsVisits)
		.orderBy(desc(schema.analyticsVisits.createdAt));

		const latestVisitByUser = new Map<string, typeof visits[0]>();
		for (const v of visits) {
			if (v.userId && !latestVisitByUser.has(v.userId)) {
				latestVisitByUser.set(v.userId, v);
			}
		}

		return allUsers.map((u) => {
			const visit = latestVisitByUser.get(u.id);
			return {
				...u,
				createdAt: new Date(u.createdAt),
				analyticsVisits: visit ? [{
					createdAt: new Date(visit.createdAt),
					pagePath: visit.pagePath,
					deviceType: visit.deviceType,
					browser: visit.browser
				}] : [],
				_count: {
					progress: 0,
					discussions: 0,
					comments: 0,
					assignments: 0,
					reportsMade: 0,
					reportsAbout: 0
				}
			};
		});
	},

	async subjects() {
		return db.select({
			id: schema.subjects.id,
			code: schema.subjects.code,
			title: schema.subjects.title,
			semester: schema.subjects.semester,
			type: schema.subjects.type,
			folderPath: schema.subjects.folderPath,
			htmlViewerPath: schema.subjects.htmlViewerPath,
			questionBank: schema.subjects.questionBank
		})
		.from(schema.subjects)
		.orderBy(asc(schema.subjects.semester), asc(schema.subjects.code));
	},

	async findUser(id: string) {
		const rows = await db.select().from(schema.users).where(eq(schema.users.id, id));
		return rows[0] || null;
	},

	async updateRole(id: string, role: UserRole) {
		const now = new Date().toISOString();
		await db.update(schema.users).set({ role, updatedAt: now }).where(eq(schema.users.id, id));
		const rows = await db.select({
			id: schema.users.id,
			username: schema.users.username,
			displayName: schema.users.displayName,
			email: schema.users.email,
			role: schema.users.role,
			createdAt: schema.users.createdAt
		}).from(schema.users).where(eq(schema.users.id, id));
		if (!rows[0]) throw new Error("User not found");
		return { ...rows[0], createdAt: new Date(rows[0].createdAt) };
	},

	async updateUser(id: string, data: { role: UserRole; status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BANNED" }) {
		const now = new Date().toISOString();
		await db.update(schema.users).set({ ...data, updatedAt: now }).where(eq(schema.users.id, id));
		const rows = await db.select({
			id: schema.users.id,
			username: schema.users.username,
			displayName: schema.users.displayName,
			email: schema.users.email,
			role: schema.users.role,
			status: schema.users.status,
			createdAt: schema.users.createdAt
		}).from(schema.users).where(eq(schema.users.id, id));
		if (!rows[0]) throw new Error("User not found");
		return { ...rows[0], createdAt: new Date(rows[0].createdAt) };
	},

	async updatePassword(id: string, passwordHash: string) {
		const now = new Date().toISOString();
		await db.update(schema.users).set({ passwordHash, updatedAt: now }).where(eq(schema.users.id, id));
		const rows = await db.select({
			id: schema.users.id,
			username: schema.users.username,
			displayName: schema.users.displayName
		}).from(schema.users).where(eq(schema.users.id, id));
		return rows[0];
	},

	async deleteUser(id: string) {
		const rows = await db.select({
			id: schema.users.id,
			username: schema.users.username,
			displayName: schema.users.displayName,
			role: schema.users.role
		}).from(schema.users).where(eq(schema.users.id, id));
		await db.delete(schema.users).where(eq(schema.users.id, id));
		return rows[0];
	},

	async adminCount() {
		const res = await db.select({ count: sql<number>`count(*)` }).from(schema.users).where(eq(schema.users.role, "ADMIN"));
		return Number(res[0]?.count || 0);
	},

	async analyticsRetention() {
		const rows = await db.select().from(schema.appSettings).where(eq(schema.appSettings.key, "analytics-retention"));
		return rows[0]?.value;
	},

	async saveAnalyticsRetention(value: {
		enabled: boolean;
		retentionDays: 90 | 180;
		action: "delete" | "anonymize";
	}) {
		const now = new Date().toISOString();
		await db.insert(schema.appSettings)
			.values({ key: "analytics-retention", value: value as any, updatedAt: now })
			.onConflictDoUpdate({
				target: schema.appSettings.key,
				set: { value: value as any, updatedAt: now }
			});
	}
};
