import {
	cleanPaperPreviewCache,
	generatePaperPreviewCache,
	getPaperPreviewCache
} from "../api/admin.api.js";

const count = document.getElementById("paperPreviewCacheCount");
const size = document.getElementById("paperPreviewCacheSize");
const message = document.getElementById("paperPreviewCacheMessage");
const output = document.getElementById("paperPreviewCacheOutput");
const generateButton = document.getElementById("generatePaperPreviewCache");
const cleanButton = document.getElementById("cleanPaperPreviewCache");

function formatBytes(bytes = 0) {
	const units = ["B", "KB", "MB", "GB"];
	let value = bytes;
	let unit = 0;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit += 1;
	}
	return `${value.toFixed(unit ? 1 : 0)} ${units[unit]}`;
}

function setMessage(text, type = "") {
	if (!message) return;
	message.textContent = text;
	message.className = `contributor-message ${type}`.trim();
}

function renderStatus(data) {
	if (count) count.textContent = String(data.count ?? 0);
	if (size) size.textContent = formatBytes(data.size || 0);
	if (output && data.output) {
		output.hidden = false;
		output.textContent = data.output;
	}
}

async function refreshStatus() {
	if (!count || !size) return;
	try {
		renderStatus(await getPaperPreviewCache());
	} catch (error) {
		setMessage(`Cache status could not be loaded: ${error.message}`, "error");
	}
}

generateButton?.addEventListener("click", async () => {
	generateButton.disabled = true;
	cleanButton.disabled = true;
	if (output) output.hidden = true;
	setMessage("Creating preview cache. This can take a little time...", "info");
	try {
		const data = await generatePaperPreviewCache();
		renderStatus(data);
		setMessage(`Preview cache created: ${data.count} image(s).`, "success");
	} catch (error) {
		setMessage(error.message, "error");
	} finally {
		generateButton.disabled = false;
		cleanButton.disabled = false;
	}
});

cleanButton?.addEventListener("click", async () => {
	if (!window.confirm("Clean all cached question-paper preview images?")) return;
	generateButton.disabled = true;
	cleanButton.disabled = true;
	if (output) output.hidden = true;
	setMessage("Cleaning preview cache...", "info");
	try {
		const data = await cleanPaperPreviewCache();
		renderStatus(data);
		setMessage(`Preview cache cleaned: ${data.deleted || 0} image(s) removed.`, "success");
	} catch (error) {
		setMessage(error.message, "error");
	} finally {
		generateButton.disabled = false;
		cleanButton.disabled = false;
	}
});

refreshStatus();
