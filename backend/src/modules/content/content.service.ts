import { AppError } from "../../shared/errors/app-error.js";
import { contentRepository } from "./content.repository.js";

function banner(item: any) {
	return {
		...item,
		startDate: item.startDate?.toISOString().slice(0, 10) || "",
		endDate: item.endDate?.toISOString().slice(0, 10) || ""
	};
}

function lecture(item: any) {
	return {
		...item,
		subject: item.subject?.code || item.subject
	};
}

function textBetween(source: string, pattern: RegExp) {
	const match = source.match(pattern);
	return match?.[1]?.replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&").trim() || "";
}

export const contentService = {
	async list(name: string) {
		if (name === "banners") return (await contentRepository.listBanners()).map(banner);
		if (name === "lectures") return (await contentRepository.listLectures()).map(lecture);
		if (name === "contributors") return contentRepository.listContributors();
		throw new AppError(404, "Content collection not found.", "CONTENT_NOT_FOUND");
	},
	async save(name: string, item: any) {
		if (name === "banners") return banner(await contentRepository.saveBanner(item));
		if (name === "lectures") return lecture(await contentRepository.saveLecture(item));
		if (name === "contributors") return contentRepository.saveContributor(item);
		throw new AppError(404, "Content collection not found.", "CONTENT_NOT_FOUND");
	},
	async remove(name: string, id: string) {
		if (name === "banners") return contentRepository.deleteBanner(id);
		if (name === "lectures") return contentRepository.deleteLecture(id);
		if (name === "contributors") return contentRepository.deleteContributor(id);
		throw new AppError(404, "Content collection not found.", "CONTENT_NOT_FOUND");
	},
	async fetchLectureMetadata(url: string) {
		if (!/^https?:\/\//i.test(url)) {
			throw new AppError(400, "Please enter a complete YouTube video or playlist URL.", "INVALID_LECTURE_URL");
		}
		const parsed = new URL(url);
		const isYoutube = /(^|\.)youtube\.com$/i.test(parsed.hostname) || /^youtu\.be$/i.test(parsed.hostname);
		if (!isYoutube) {
			throw new AppError(400, "Fetch currently supports YouTube video and playlist URLs.", "UNSUPPORTED_LECTURE_URL");
		}

		const oembedUrl = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
		const response = await fetch(oembedUrl);
		if (!response.ok) {
			throw new AppError(422, "Could not fetch details from YouTube. Please fill the fields manually.", "LECTURE_FETCH_FAILED");
		}
		const metadata = await response.json() as {
			title?: string;
			author_name?: string;
			thumbnail_url?: string;
		};

		let description = "";
		try {
			const page = await fetch(url, { headers: { "User-Agent": "GyanPath metadata fetcher" } });
			const html = await page.text();
			description = textBetween(html, /<meta\s+name="description"\s+content="([^"]*)"/i)
				|| textBetween(html, /<meta\s+property="og:description"\s+content="([^"]*)"/i);
		} catch {
			description = "";
		}

		return {
			title: metadata.title || "",
			teacher: metadata.author_name || "",
			description,
			thumbnailUrl: metadata.thumbnail_url || ""
		};
	}
};

