import { deleteContent, getContent, saveContent } from "../api/content.api.js";

export class VideoLectureStore {
	createLectureId() {
		return crypto.randomUUID();
	}

	youtubeId(url) {
		const match = String(url || "").match(
			/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
		);
		return match?.[1] || "";
	}

	youtubePlaylistId(url) {
		try {
			const parsed = new URL(String(url || ""));
			return parsed.searchParams.get("list") || "";
		} catch {
			return "";
		}
	}

	lectureType(url) {
		return this.youtubePlaylistId(url) ? "playlist" : "video";
	}

	youtubeEmbedUrl(url, origin = "") {
		const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : "";
		const playlistId = this.youtubePlaylistId(url);
		if (playlistId) {
			return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&rel=0${originParam}`;
		}
		const videoId = this.youtubeId(url);
		return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0${originParam}` : "";
	}

	normalizeLecture(item) {
		return {
			id: String(item.id || this.createLectureId()),
			subject: String(item.subject || "").trim().toUpperCase(),
			type: item.type === "playlist" ? "playlist" : this.lectureType(item.url),
			title: String(item.title || "").trim(),
			unit: String(item.unit || "").trim(),
			description: String(item.description || "").trim(),
			url: String(item.url || "").trim(),
			teacher: String(item.teacher || "").trim(),
			language: String(item.language || "Hindi").trim(),
			order: Number(item.order || 0),
			active: item.active !== false
		};
	}

	async getLectures() {
		return (await getContent("lectures")).map((lecture) => this.normalizeLecture(lecture));
	}

	async saveLecture(lecture) {
		return saveContent("lectures", this.normalizeLecture(lecture));
	}

	async removeLecture(id) {
		return deleteContent("lectures", id);
	}

	async getPublishedLectures(subject = "") {
		const normalizedSubject = subject.trim().toUpperCase();
		return (await this.getLectures())
			.filter((lecture) => lecture.active)
			.filter((lecture) => !normalizedSubject || lecture.subject === normalizedSubject)
			.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
	}
}

export const videoLectureStore = new VideoLectureStore();
