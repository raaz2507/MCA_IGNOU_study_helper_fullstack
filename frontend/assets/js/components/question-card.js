export function questionCardMarkup({
	question,
	index,
	active,
	title,
	sessions,
	repeatLabel,
	marksLabel,
	escapeHtml,
	escapeAttr
}) {
	const tags = (question.tags || [])
		.slice(0, 4)
		.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
		.join("");

	return `
		<div class="qcard ${active ? "active" : ""}" data-id="${escapeAttr(question.id)}">
			<div class="qtop">
				<span class="badge">${index + 1}</span>
				<span class="badge green">${repeatLabel}</span>
				<span class="badge orange">${escapeHtml(marksLabel)}</span>
			</div>
			<h3>${escapeHtml(title)}</h3>
			<div class="meta">
				<span>${escapeHtml(question.category || "")}</span>
				<span>•</span>
				<span>${escapeHtml(sessions)}</span>
				<span>•</span>
				<span>${escapeHtml(question.difficulty || "")}</span>
			</div>
			<div class="tagList">${tags}</div>
		</div>`;
}
