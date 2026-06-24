import { deleteContent, getContent, saveContent } from "../api/content.api.js";

export function createBannerId() {
	return crypto.randomUUID();
}

export function normalizeBanner(item) {
	return {
		id: String(item.id || createBannerId()),
		title: String(item.title || "").trim(),
		description: String(item.description || "").trim(),
		category: String(item.category || "General").trim(),
		image: String(item.image || "").trim(),
		buttonText: String(item.buttonText || "").trim(),
		buttonUrl: String(item.buttonUrl || "").trim(),
		startDate: String(item.startDate || ""),
		endDate: String(item.endDate || ""),
		priority: Number(item.priority || 0),
		active: item.active !== false
	};
}

export async function getBanners() {
	return (await getContent("banners")).map(normalizeBanner);
}

export async function saveBanner(banner) {
	return saveContent("banners", normalizeBanner(banner));
}

export async function removeBanner(id) {
	return deleteContent("banners", id);
}

export async function getVisibleBanners(now = new Date()) {
	const today = now.toISOString().slice(0, 10);
	return (await getBanners())
		.filter((banner) => banner.active)
		.filter((banner) => !banner.startDate || banner.startDate <= today)
		.filter((banner) => !banner.endDate || banner.endDate >= today)
		.sort((a, b) => a.priority - b.priority);
}
