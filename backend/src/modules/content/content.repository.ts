import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { asc, eq, inArray } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../config/db.js";
import { banners, lectures, subjects, contributors } from "../../infrastructure/database/schema.js";
import { cleanupReplacedUpload, deleteUnreferencedUpload } from "../../shared/upload-cleanup.js";

function decodeImageDataUrl(value: string | null | undefined) {
	const match = String(value || "").match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=\s]+)$/);
	if (!match) return null;
	const mimeType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
	const extension = ({ "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp" } as Record<string, string>)[mimeType];
	if (!extension) return null;
	return {
		buffer: Buffer.from(match[2].replace(/\s/g, ""), "base64"),
		extension
	};
}

import { storageService } from "../../infrastructure/storage/storage.service.js";

async function persistImageDataUrl(categoryParts: string[], value: string | null | undefined) {
	const decoded = decodeImageDataUrl(value);
	if (!decoded) return value || null;
	const fileName = `${Date.now()}-${crypto.randomUUID()}${decoded.extension}`;
	return storageService.saveUpload(categoryParts, fileName, decoded.buffer);
}

function persistContributorAvatar(contributorId: string, avatar: string | null | undefined) {
	return persistImageDataUrl(["contributors", contributorId], avatar);
}

function persistBannerImage(bannerId: string, image: string | null | undefined) {
	return persistImageDataUrl(["banners", bannerId], image);
}

export const contentRepository = {
	async listBanners() {
		const rows = await db.select().from(banners).orderBy(asc(banners.priority), asc(banners.createdAt));
		return Promise.all(rows.map(async (banner) => {
			const image = await persistBannerImage(banner.id, banner.image);
			if (image !== banner.image) {
				await db.update(banners).set({ image, updatedAt: new Date().toISOString() }).where(eq(banners.id, banner.id));
				return { ...banner, image };
			}
			return banner;
		}));
	},

	async saveBanner(item: any) {
		const id = item.id || crypto.randomUUID();
		let previousImage: string | null = null;
		if (item.id) {
			const prev = await db.select({ image: banners.image }).from(banners).where(eq(banners.id, id));
			previousImage = prev[0]?.image || null;
		}

		const image = await persistBannerImage(id, item.image);
		const now = new Date().toISOString();
		const data = {
			title: item.title,
			description: item.description,
			category: item.category,
			image,
			buttonText: item.buttonText || null,
			buttonUrl: item.buttonUrl || null,
			startDate: item.startDate ? new Date(item.startDate).toISOString() : null,
			endDate: item.endDate ? new Date(item.endDate).toISOString() : null,
			priority: Number(item.priority || 0),
			active: item.active !== false,
			updatedAt: now
		};

		if (item.id) {
			await db.insert(banners)
				.values({ id, ...data, createdAt: now })
				.onConflictDoUpdate({
					target: banners.id,
					set: data
				});
		} else {
			await db.insert(banners).values({ id, ...data, createdAt: now });
		}

		const savedRows = await db.select().from(banners).where(eq(banners.id, id));
		const result = savedRows[0];
		await cleanupReplacedUpload(previousImage, result?.image);
		return result;
	},

	async deleteBanner(id: string) {
		const rows = await db.select().from(banners).where(eq(banners.id, id));
		const banner = rows[0];
		await db.delete(banners).where(eq(banners.id, id));
		if (banner?.image) {
			await deleteUnreferencedUpload(banner.image);
		}
		return banner;
	},

	async listLectures() {
		const rows = await db.select({
			lecture: lectures,
			subjectCode: subjects.code
		})
		.from(lectures)
		.innerJoin(subjects, eq(lectures.subjectId, subjects.id))
		.orderBy(asc(lectures.order), asc(lectures.title));

		return rows.map((r) => ({
			...r.lecture,
			subject: { code: r.subjectCode }
		}));
	},

	async subjectCodes() {
		const rows = await db.select({ code: subjects.code }).from(subjects);
		return new Set(rows.map((s) => s.code.toUpperCase()));
	},

	async syncLectureCatalog(items: any[], updateExisting: boolean) {
		const subRows = await db.select({ id: subjects.id, code: subjects.code }).from(subjects);
		const subjectIds = new Map(subRows.map((s) => [s.code.toUpperCase(), s.id]));

		const itemIds = items.map((item) => item.id);
		let existingIds = new Set<string>();
		if (itemIds.length > 0) {
			const existingRows = await db.select({ id: lectures.id }).from(lectures).where(inArray(lectures.id, itemIds));
			existingIds = new Set(existingRows.map((l) => l.id));
		}

		let added = 0;
		let updated = 0;
		let skipped = 0;
		const now = new Date().toISOString();

		await db.transaction(async (tx) => {
			for (const item of items) {
				const subjectId = subjectIds.get(item.subject);
				if (!subjectId) {
					skipped += 1;
					continue;
				}
				const data = {
					subjectId,
					title: item.title,
					unit: item.unit || null,
					description: item.description || null,
					url: item.url,
					teacher: item.teacher || null,
					language: item.language,
					order: item.order,
					active: item.active !== false,
					updatedAt: now
				};

				if (existingIds.has(item.id)) {
					if (!updateExisting) {
						skipped += 1;
						continue;
					}
					await tx.update(lectures).set(data).where(eq(lectures.id, item.id));
					updated += 1;
				} else {
					await tx.insert(lectures).values({ id: item.id, ...data, createdAt: now });
					added += 1;
				}
			}
		});

		return { added, updated, skipped, errors: 0, total: items.length };
	},

	async saveLecture(item: any) {
		const subRows = await db.select().from(subjects).where(eq(subjects.code, item.subject));
		const subject = subRows[0];
		if (!subject) throw new Error("Selected subject does not exist.");

		const id = item.id || crypto.randomUUID();
		const now = new Date().toISOString();
		const data = {
			subjectId: subject.id,
			title: item.title,
			unit: item.unit || null,
			description: item.description || null,
			url: item.url,
			teacher: item.teacher || null,
			language: item.language,
			order: Number(item.order || 0),
			active: item.active !== false,
			updatedAt: now
		};

		if (item.id) {
			await db.insert(lectures)
				.values({ id, ...data, createdAt: now })
				.onConflictDoUpdate({
					target: lectures.id,
					set: data
				});
		} else {
			await db.insert(lectures).values({ id, ...data, createdAt: now });
		}

		const rows = await db.select().from(lectures).where(eq(lectures.id, id));
		return rows[0];
	},

	async deleteLecture(id: string) {
		const rows = await db.select().from(lectures).where(eq(lectures.id, id));
		await db.delete(lectures).where(eq(lectures.id, id));
		return rows[0];
	},

	async listContributors() {
		const rows = await db.select().from(contributors).where(eq(contributors.active, true)).orderBy(asc(contributors.order), asc(contributors.name));
		return Promise.all(rows.map(async (contributor) => {
			const avatar = await persistContributorAvatar(contributor.id, contributor.avatar);
			if (avatar !== contributor.avatar) {
				await db.update(contributors).set({ avatar, updatedAt: new Date().toISOString() }).where(eq(contributors.id, contributor.id));
				return { ...contributor, avatar };
			}
			return contributor;
		}));
	},

	async saveContributor(item: any) {
		const id = item.id || crypto.randomUUID();
		let previousAvatar: string | null = null;
		if (item.id) {
			const prev = await db.select({ avatar: contributors.avatar }).from(contributors).where(eq(contributors.id, id));
			previousAvatar = prev[0]?.avatar || null;
		}

		const avatar = await persistContributorAvatar(id, item.avatar);
		const now = new Date().toISOString();
		const data = {
			name: item.name,
			info: item.info,
			avatar,
			profileUrl: /^https?:\/\//i.test(String(item.profileUrl || "").trim())
				? String(item.profileUrl).trim()
				: null,
			contributions: item.contributions || [],
			order: Number(item.order || 0),
			active: item.active !== false,
			updatedAt: now
		};

		if (item.id) {
			await db.insert(contributors)
				.values({ id, ...data, createdAt: now })
				.onConflictDoUpdate({
					target: contributors.id,
					set: data
				});
		} else {
			await db.insert(contributors).values({ id, ...data, createdAt: now });
		}

		const rows = await db.select().from(contributors).where(eq(contributors.id, id));
		const result = rows[0];
		await cleanupReplacedUpload(previousAvatar, result?.avatar);
		return result;
	},

	async deleteContributor(id: string) {
		const rows = await db.select().from(contributors).where(eq(contributors.id, id));
		const contributor = rows[0];
		await db.delete(contributors).where(eq(contributors.id, id));
		if (contributor?.avatar) {
			await deleteUnreferencedUpload(contributor.avatar);
		}
		return contributor;
	}
};
