import { storageService } from "../infrastructure/storage/storage.service.js";
import { programCatalogService } from "../modules/catalog/program-catalog.service.js";
import { questionsService } from "../modules/questions/questions.service.js";
import { authService } from "../modules/auth/auth.service.js";
import { emailVerificationService } from "../modules/auth/email-verification.service.js";
import { contentService } from "../modules/content/content.service.js";
import { lectureCatalogService } from "../modules/content/lecture-catalog.service.js";
import { adminService } from "../modules/admin/admin.service.js";
import { progressService } from "../modules/progress/progress.service.js";

/**
 * AppCore - Central Typed Application Gateway & Service Composition Root.
 * Provides unified, single-point access to all domain services without
 * holding any business logic itself.
 */
export const appCore = Object.freeze({
	storage: storageService,
	catalog: programCatalogService,
	questions: questionsService,
	auth: authService,
	emailVerification: emailVerificationService,
	content: contentService,
	lectures: lectureCatalogService,
	admin: adminService,
	progress: progressService
});

export type AppCore = typeof appCore;
