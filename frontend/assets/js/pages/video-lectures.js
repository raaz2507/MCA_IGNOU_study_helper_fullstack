import { getPublishedLectures, youtubeEmbedUrl } from "../utils/video-lectures-store.js";

const params = new URLSearchParams(window.location.search);
const subject = String(params.get("subject") || "").trim().toUpperCase();
const title = document.getElementById("lecturePageTitle");
const subtitle = document.getElementById("lecturePageSubtitle");
const grid = document.getElementById("lectureGrid");
const search = document.getElementById("lectureSearch");
const language = document.getElementById("lectureLanguageFilter");
const allLectures = await getPublishedLectures(subject);

if (title) title.textContent = subject ? `${subject} Video Lectures` : "Video Lectures";
if (subtitle) {
	subtitle.textContent = subject
		? `Published online lectures for ${subject}.`
		: "Published lectures for all MCA subjects.";
}
document.title = `${subject ? `${subject} | ` : ""}Video Lectures`;

function safeUrl(url) {
	try {
		const parsed = new URL(url);
		return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
	} catch {
		return "";
	}
}

function render() {
	const query = search.value.trim().toLowerCase();
	const selectedLanguage = language.value;
	const lectures = allLectures.filter((lecture) => {
		const text = `${lecture.title} ${lecture.unit} ${lecture.teacher} ${lecture.description}`.toLowerCase();
		return (!query || text.includes(query))
			&& (!selectedLanguage || lecture.language === selectedLanguage);
	});

	grid.replaceChildren();
	if (!lectures.length) {
		const empty = document.createElement("div");
		empty.className = "lecture-empty";
		empty.innerHTML = "<h2>No lectures found</h2><p>Add or publish lectures from the Admin/Editor Dashboard.</p>";
		grid.append(empty);
		return;
	}

	lectures.forEach((lecture) => {
		const card = document.createElement("article");
		card.className = "lecture-card";
		const media = document.createElement("div");
		media.className = "lecture-media";
		const embedUrl = youtubeEmbedUrl(lecture.url, window.location.origin);
		const isPlaylist = lecture.type === "playlist";
		if (embedUrl) {
			const frame = document.createElement("iframe");
			frame.src = embedUrl;
			frame.title = lecture.title;
			frame.loading = "lazy";
			frame.referrerPolicy = "strict-origin-when-cross-origin";
			frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
			frame.allowFullscreen = true;
			media.append(frame);
		} else {
			media.textContent = isPlaylist ? "Playlist" : "Video";
		}

		const content = document.createElement("div");
		content.className = "lecture-card-content";
		const tags = document.createElement("div");
		tags.className = "lecture-tags";
		[lecture.subject, isPlaylist ? "Playlist" : "Video", lecture.language, lecture.unit].filter(Boolean).forEach((value) => {
			const tag = document.createElement("span");
			tag.textContent = value;
			tags.append(tag);
		});
		const heading = document.createElement("h2");
		heading.textContent = lecture.title;
		const description = document.createElement("p");
		description.textContent = lecture.description || "Open this lecture to start watching.";
		content.append(tags, heading, description);
		if (lecture.teacher) {
			const teacher = document.createElement("small");
			teacher.textContent = `Teacher / Channel: ${lecture.teacher}`;
			content.append(teacher);
		}
		const url = safeUrl(lecture.url);
		if (url) {
			const link = document.createElement("a");
			link.href = url;
			link.target = "_blank";
			link.rel = "noopener noreferrer";
			link.textContent = "Open on YouTube";
			content.append(link);
		}
		card.append(media, content);
		grid.append(card);
	});
}

[search, language].forEach((control) => control.addEventListener("input", render));
render();

