import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
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

async function persistImageDataUrl(categoryParts: string[], value: string | null | undefined) {
	const decoded = decodeImageDataUrl(value);
	if (!decoded) return value || null;
	const fileName = `${Date.now()}-${crypto.randomUUID()}${decoded.extension}`;
	const uploadDir = path.join(env.projectRoot, "uploads", ...categoryParts);
	const publicPath = `/uploads/${[...categoryParts, fileName].join("/")}`;
	await fs.mkdir(uploadDir, { recursive: true });
	await fs.writeFile(path.join(uploadDir, fileName), decoded.buffer);
	return publicPath;
}

function persistContributorAvatar(contributorId: string, avatar: string | null | undefined) {
	return persistImageDataUrl(["contributors", contributorId], avatar);
}

function persistBannerImage(bannerId: string, image: string | null | undefined) {
	return persistImageDataUrl(["banners", bannerId], image);
}

export const contentRepository = {
	async listBanners() {
		const banners = await prisma.banner.findMany({ orderBy: [{ priority: "asc" }, { createdAt: "asc" }] });
		return Promise.all(banners.map(async (banner) => {
			const image = await persistBannerImage(banner.id, banner.image);
			if (image !== banner.image) {
				return prisma.banner.update({ where: { id: banner.id }, data: { image } });
			}
			return banner;
		}));
	},
	async saveBanner(item: any) {
		const id = item.id || crypto.randomUUID();
		const previous = item.id
			? await prisma.banner.findUnique({ where: { id }, select: { image: true } })
			: null;
		const image = await persistBannerImage(id, item.image);
		const data = {
			title: item.title,
			description: item.description,
			category: item.category,
			image,
			buttonText: item.buttonText || null,
			buttonUrl: item.buttonUrl || null,
			startDate: item.startDate ? new Date(item.startDate) : null,
			endDate: item.endDate ? new Date(item.endDate) : null,
			priority: Number(item.priority || 0),
			active: item.active !== false
		};
		const saved = item.id
			? prisma.banner.upsert({ where: { id: item.id }, update: data, create: { id, ...data } })
			: prisma.banner.create({ data: { id, ...data } });
		const result = await saved;
		await cleanupReplacedUpload(previous?.image, result.image);
		return result;
	},
	async deleteBanner(id: string) {
		const deleted = await prisma.banner.delete({ where: { id } });
		await deleteUnreferencedUpload(deleted.image);
		return deleted;
	},
	listLectures() {
		return prisma.lecture.findMany({
			include: { subject: { select: { code: true } } },
			orderBy: [{ order: "asc" }, { title: "asc" }]
		});
	},
	async saveLecture(item: any) {
		const subject = await prisma.subject.findUnique({ where: { code: item.subject } });
		if (!subject) throw new Error("Selected subject does not exist.");
		const data = {
			subjectId: subject.id,
			title: item.title,
			unit: item.unit || null,
			description: item.description || null,
			url: item.url,
			teacher: item.teacher || null,
			language: item.language,
			order: Number(item.order || 0),
			active: item.active !== false
		};
		return item.id
			? prisma.lecture.upsert({ where: { id: item.id }, update: data, create: { id: item.id, ...data } })
			: prisma.lecture.create({ data });
	},
	deleteLecture(id: string) {
		return prisma.lecture.delete({ where: { id } });
	},
	async listContributors() {
		const contributors = await prisma.contributor.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { name: "asc" }] });
		return Promise.all(contributors.map(async (contributor) => {
			const avatar = await persistContributorAvatar(contributor.id, contributor.avatar);
			if (avatar !== contributor.avatar) {
				return prisma.contributor.update({ where: { id: contributor.id }, data: { avatar } });
			}
			return contributor;
		}));
	},
	async saveContributor(item: any) {
		const id = item.id || crypto.randomUUID();
		const previous = item.id
			? await prisma.contributor.findUnique({ where: { id }, select: { avatar: true } })
			: null;
		const avatar = await persistContributorAvatar(id, item.avatar);
		const data = {
			name: item.name,
			info: item.info,
			avatar,
			profileUrl: /^https?:\/\//i.test(String(item.profileUrl || "").trim())
				? String(item.profileUrl).trim()
				: null,
			contributions: item.contributions || [],
			order: Number(item.order || 0),
			active: item.active !== false
		};
		const saved = item.id
			? prisma.contributor.upsert({ where: { id: item.id }, update: data, create: { id, ...data } })
			: prisma.contributor.create({ data: { id, ...data } });
		const result = await saved;
		await cleanupReplacedUpload(previous?.avatar, result.avatar);
		return result;
	},
	async deleteContributor(id: string) {
		const deleted = await prisma.contributor.delete({ where: { id } });
		await deleteUnreferencedUpload(deleted.avatar);
		return deleted;
	}
};
