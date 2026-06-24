export function createPaperCard({ file, template, viewerUrl, formatBytes }) {
	const card = template.content.cloneNode(true);
	const url = viewerUrl(file);
	const previewLink = card.querySelector(".preview-link");
	const preview = card.querySelector(".pdf-preview");
	const openButton = card.querySelector(".open-button");

	previewLink.href = url;
	openButton.href = url;
	preview.src = file.preview;
	preview.alt = `${file.title} first page preview`;
	card.querySelector(".subject-tag").textContent = file.subject;
	card.querySelector(".language-tag").textContent =
		file.english && file.hindi
			? "English + हिन्दी"
			: (file.hindi ? "हिन्दी" : "English");
	card.querySelector(".pdf-title").textContent = file.title;
	card.querySelector(".file-name").textContent = file.fileName;
	card.querySelector(".exam-session").textContent = file.session;
	card.querySelector(".page-count").textContent = file.pages || "—";
	card.querySelector(".file-size").textContent = formatBytes(file.size);
	card.querySelector(".updated-date").textContent = file.updated;
	return card;
}
