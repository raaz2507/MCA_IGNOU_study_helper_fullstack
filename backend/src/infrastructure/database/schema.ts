import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

export const programs = sqliteTable("Program", {
	id: text("id").primaryKey(),
	code: text("code").notNull().unique(),
	title: text("title").notNull(),
	totalSemesters: integer("totalSemesters").notNull().default(4),
	folderName: text("folderName").notNull(),
	active: integer("active", { mode: "boolean" }).notNull().default(true),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const users = sqliteTable("User", {
	id: text("id").primaryKey(),
	email: text("email").unique(),
	username: text("username").notNull().unique(),
	passwordHash: text("passwordHash").notNull(),
	displayName: text("displayName").notNull(),
	role: text("role").notNull().default("USER"),
	status: text("status").notNull().default("PENDING"),
	emailVerifiedAt: text("emailVerifiedAt"),
	emailVerificationRequired: integer("emailVerificationRequired", { mode: "boolean" }).notNull().default(false),
	emailVerificationTokenHash: text("emailVerificationTokenHash").unique(),
	emailVerificationExpiresAt: text("emailVerificationExpiresAt"),
	selectedProgramId: text("selectedProgramId").references(() => programs.id),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const semesters = sqliteTable("Semester", {
	id: text("id").primaryKey(),
	programId: text("programId").references(() => programs.id, { onDelete: "cascade" }),
	number: integer("number").notNull(),
	title: text("title").notNull(),
	active: integer("active", { mode: "boolean" }).notNull().default(true),
	status: text("status").notNull().default("PUBLISHED"),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const sessions = sqliteTable("Session", {
	id: text("id").primaryKey(),
	tokenHash: text("tokenHash").notNull().unique(),
	userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
	expiresAt: text("expiresAt").notNull(),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const subjects = sqliteTable("Subject", {
	id: text("id").primaryKey(),
	programId: text("programId").references(() => programs.id, { onDelete: "cascade" }),
	code: text("code").notNull().unique(),
	title: text("title").notNull(),
	semester: integer("semester").notNull(),
	type: text("type").notNull(),
	folderPath: text("folderPath").notNull().unique(),
	htmlViewerPath: text("htmlViewerPath"),
	questionBank: integer("questionBank", { mode: "boolean" }).notNull().default(false),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const studyMaterials = sqliteTable("StudyMaterial", {
	id: text("id").primaryKey(),
	subjectId: text("subjectId").notNull().references(() => subjects.id, { onDelete: "cascade" }),
	groupName: text("groupName").notNull(),
	title: text("title").notNull(),
	filePath: text("filePath").notNull().unique(),
	hindiPath: text("hindiPath"),
	englishChecksum: text("englishChecksum"),
	hindiChecksum: text("hindiChecksum"),
	status: text("status").notNull().default("PUBLISHED"),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const papers = sqliteTable("Paper", {
	id: text("id").primaryKey(),
	subjectId: text("subjectId").notNull().references(() => subjects.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	session: text("session").notNull(),
	fileName: text("fileName").notNull(),
	englishPath: text("englishPath").notNull(),
	hindiPath: text("hindiPath"),
	englishChecksum: text("englishChecksum"),
	hindiChecksum: text("hindiChecksum"),
	previewPath: text("previewPath"),
	pageCount: integer("pageCount"),
	fileSize: integer("fileSize"),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
	status: text("status").notNull().default("PUBLISHED"),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const questions = sqliteTable("Question", {
	id: text("id").primaryKey(),
	subjectId: text("subjectId").notNull().references(() => subjects.id, { onDelete: "cascade" }),
	sourceFile: text("sourceFile"),
	title: text("title").notNull(),
	questionMd: text("questionMd"),
	category: text("category"),
	difficulty: text("difficulty"),
	marks: integer("marks"),
	tags: text("tags", { mode: "json" }).notNull(),
	appearedIn: text("appearedIn", { mode: "json" }).notNull(),
	relatedData: text("relatedData", { mode: "json" }),
	media: text("media", { mode: "json" }),
	contentStatus: text("contentStatus").notNull().default("PENDING"),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const answers = sqliteTable("Answer", {
	id: text("id").primaryKey(),
	questionId: text("questionId").notNull().references(() => questions.id, { onDelete: "cascade" }),
	language: text("language").notNull(),
	mode: text("mode").notNull(),
	content: text("content").notNull()
});

export const progress = sqliteTable("Progress", {
	userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
	questionId: text("questionId").notNull().references(() => questions.id, { onDelete: "cascade" }),
	completed: integer("completed", { mode: "boolean" }).notNull().default(false),
	revision: integer("revision", { mode: "boolean" }).notNull().default(false),
	bookmarked: integer("bookmarked", { mode: "boolean" }).notNull().default(false),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
}, (table) => [
	primaryKey({ columns: [table.userId, table.questionId] })
]);

export const notes = sqliteTable("Note", {
	id: text("id").primaryKey(),
	userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
	questionId: text("questionId").references(() => questions.id, { onDelete: "cascade" }),
	content: text("content").notNull(),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const banners = sqliteTable("Banner", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	category: text("category").notNull(),
	image: text("image"),
	buttonText: text("buttonText"),
	buttonUrl: text("buttonUrl"),
	startDate: text("startDate"),
	endDate: text("endDate"),
	priority: integer("priority").default(0),
	active: integer("active", { mode: "boolean" }).notNull().default(true),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const lectures = sqliteTable("Lecture", {
	id: text("id").primaryKey(),
	subjectId: text("subjectId").notNull().references(() => subjects.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	unit: text("unit"),
	description: text("description"),
	url: text("url").notNull(),
	teacher: text("teacher"),
	language: text("language"),
	order: integer("order").default(0),
	active: integer("active", { mode: "boolean" }).notNull().default(true),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const contributors = sqliteTable("Contributor", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	info: text("info"),
	avatar: text("avatar"),
	profileUrl: text("profileUrl"),
	contributions: text("contributions", { mode: "json" }),
	order: integer("order").default(0),
	active: integer("active", { mode: "boolean" }).notNull().default(true),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const discussions = sqliteTable("Discussion", {
	id: text("id").primaryKey(),
	subjectId: text("subjectId").notNull().references(() => subjects.id, { onDelete: "cascade" }),
	authorId: text("authorId").notNull().references(() => users.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	content: text("content").notNull(),
	solved: integer("solved", { mode: "boolean" }).notNull().default(false),
	anonymous: integer("anonymous", { mode: "boolean" }).notNull().default(false),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const comments = sqliteTable("Comment", {
	id: text("id").primaryKey(),
	discussionId: text("discussionId").notNull().references(() => discussions.id, { onDelete: "cascade" }),
	authorId: text("authorId").notNull().references(() => users.id, { onDelete: "cascade" }),
	parentId: text("parentId"),
	content: text("content").notNull(),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const appSettings = sqliteTable("AppSetting", {
	key: text("key").primaryKey(),
	value: text("value", { mode: "json" }).notNull(),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const assignments = sqliteTable("Assignment", {
	id: text("id").primaryKey(),
	subjectId: text("subjectId").notNull().references(() => subjects.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	description: text("description"),
	dueDate: text("dueDate"),
	solutionUrl: text("solutionUrl"),
	status: text("status").notNull().default("PUBLISHED"),
	createdById: text("createdById").notNull().references(() => users.id, { onDelete: "cascade" }),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const reports = sqliteTable("Report", {
	id: text("id").primaryKey(),
	reporterId: text("reporterId").notNull().references(() => users.id, { onDelete: "cascade" }),
	reportedUserId: text("reportedUserId").references(() => users.id, { onDelete: "set null" }),
	targetType: text("targetType").notNull(),
	targetId: text("targetId"),
	reason: text("reason").notNull(),
	details: text("details"),
	status: text("status").notNull().default("OPEN"),
	resolution: text("resolution"),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
	updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const fileAssets = sqliteTable("FileAsset", {
	id: text("id").primaryKey(),
	originalName: text("originalName").notNull(),
	storedName: text("storedName").notNull(),
	mimeType: text("mimeType").notNull(),
	size: integer("size").notNull(),
	path: text("path").notNull(),
	category: text("category").notNull(),
	uploadedById: text("uploadedById").notNull(),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const auditLogs = sqliteTable("AuditLog", {
	id: text("id").primaryKey(),
	actorId: text("actorId").references(() => users.id, { onDelete: "set null" }),
	action: text("action").notNull(),
	entityType: text("entityType").notNull(),
	entityId: text("entityId"),
	details: text("details", { mode: "json" }),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const analyticsVisits = sqliteTable("AnalyticsVisit", {
	id: text("id").primaryKey(),
	userId: text("userId").references(() => users.id, { onDelete: "set null" }),
	visitorHash: text("visitorHash").notNull(),
	sessionId: text("sessionId").notNull(),
	pagePath: text("pagePath").notNull(),
	referrer: text("referrer").notNull(),
	referrerSource: text("referrerSource").notNull(),
	deviceType: text("deviceType").notNull(),
	browser: text("browser").notNull(),
	country: text("country"),
	loggedIn: integer("loggedIn", { mode: "boolean" }).notNull().default(false),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString())
});

export const feedback = sqliteTable("Feedback", {
	id: text("id").primaryKey(),
	userId: text("userId").references(() => users.id, { onDelete: "set null" }),
	visitorHash: text("visitorHash"),
	mood: text("mood").notNull(),
	message: text("message").notNull(),
	pagePath: text("pagePath").notNull(),
	createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString())
});
