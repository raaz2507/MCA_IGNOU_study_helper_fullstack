import { deleteContent, getContent, saveContent } from "../api/content.api.js";

export const createLectureId = () => crypto.randomUUID();

export function youtubeId(url) {
	const match = String(url || "").match(
		/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
	);
	return match?.[1] || "";
}

export function youtubePlaylistId(url) {
	try {
		const parsed = new URL(String(url || ""));
		return parsed.searchParams.get("list") || "";
	} catch {
		return "";
	}
}

export function lectureType(url) {
	return youtubePlaylistId(url) ? "playlist" : "video";
}

export function youtubeEmbedUrl(url, origin = "") {
	const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : "";
	const playlistId = youtubePlaylistId(url);
	if (playlistId) {
		return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&rel=0${originParam}`;
	}
	const videoId = youtubeId(url);
	return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0${originParam}` : "";
}

export function normalizeLecture(item) {
	return {
		id: String(item.id || createLectureId()),
		subject: String(item.subject || "").trim().toUpperCase(),
		type: item.type === "playlist" ? "playlist" : lectureType(item.url),
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

export async function getLectures() {
	return (await getContent("lectures")).map(normalizeLecture);
}

export async function saveLecture(lecture) {
	return saveContent("lectures", normalizeLecture(lecture));
}

export async function removeLecture(id) {
	return deleteContent("lectures", id);
}

export async function getPublishedLectures(subject = "") {
	const normalizedSubject = subject.trim().toUpperCase();
	return (await getLectures())
		.filter((lecture) => lecture.active)
		.filter((lecture) => !normalizedSubject || lecture.subject === normalizedSubject)
		.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}
