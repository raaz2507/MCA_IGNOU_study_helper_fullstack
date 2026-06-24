import { prisma } from "../../config/prisma.js";

export const contentRepository = {
	listBanners() {
		return prisma.banner.findMany({ orderBy: [{ priority: "asc" }, { createdAt: "asc" }] });
	},
	saveBanner(item: any) {
		const data = {
			title: item.title,
			description: item.description,
			category: item.category,
			image: item.image || null,
			buttonText: item.buttonText || null,
			buttonUrl: item.buttonUrl || null,
			startDate: item.startDate ? new Date(item.startDate) : null,
			endDate: item.endDate ? new Date(item.endDate) : null,
			priority: Number(item.priority || 0),
			active: item.active !== false
		};
		return item.id
			? prisma.banner.upsert({ where: { id: item.id }, update: data, create: { id: item.id, ...data } })
			: prisma.banner.create({ data });
	},
	deleteBanner(id: string) {
		return prisma.banner.delete({ where: { id } });
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
	listContributors() {
		return prisma.contributor.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { name: "asc" }] });
	},
	saveContributor(item: any) {
		const data = {
			name: item.name,
			info: item.info,
			avatar: item.avatar || null,
			contributions: item.contributions || [],
			order: Number(item.order || 0),
			active: item.active !== false
		};
		return item.id
			? prisma.contributor.upsert({ where: { id: item.id }, update: data, create: { id: item.id, ...data } })
			: prisma.contributor.create({ data });
	},
	deleteContributor(id: string) {
		return prisma.contributor.delete({ where: { id } });
	}
};

