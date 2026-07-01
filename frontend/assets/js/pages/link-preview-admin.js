import {
	deleteLinkPreviewSettings,
	getLinkPreviewSettings,
	saveLinkPreviewSettings,
	uploadSettingQrImage
} from "../api/admin.api.js";

export class LinkPreviewAdminPage {
	initialize() {
const form = document.getElementById("linkPreviewForm");
const enabled = document.getElementById("linkPreviewEnabled");
const title = document.getElementById("linkPreviewTitleInput");
const description = document.getElementById("linkPreviewDescription");
const url = document.getElementById("linkPreviewUrl");
const imageUrl = document.getElementById("linkPreviewImageUrl");
const imageFile = document.getElementById("linkPreviewImageFile");
const imagePreview = document.getElementById("linkPreviewImagePreview");
const previewTitle = document.getElementById("linkPreviewPreviewTitle");
const previewDescription = document.getElementById("linkPreviewPreviewDescription");
const previewUrl = document.getElementById("linkPreviewPreviewUrl");
const imageMeta = document.getElementById("linkPreviewImageMeta");
const message = document.getElementById("linkPreviewMessage");
const resetButton = document.getElementById("resetLinkPreviewSettings");
const fallbackPreviewImage = imagePreview?.dataset.fallbackSrc || "/assets/images/fallback_images/gyanpath-link-preview-banner.jpg";

let uploadState = { path: "", file: null, meta: null };

function revokeUploadPreview() {
	if (uploadState.path?.startsWith("blob:")) URL.revokeObjectURL(uploadState.path);
}

function selectedSource() {
	return document.querySelector('input[name="linkPreviewImageSource"]:checked')?.value || "url";
}

function setMessage(text, type = "") {
	if (!message) return;
	message.textContent = text;
	message.className = `contributor-message ${type}`.trim();
}

function formatBytes(size = 0) {
	if (!size) return "";
	const value = size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(size / 1024)} KB`;
	return value;
}

function formatMeta(meta) {
	if (!meta) return "";
	return [meta.type, formatBytes(meta.size), meta.width && meta.height ? `${meta.width} x ${meta.height}px` : "", meta.name]
		.filter(Boolean)
		.join(" | ");
}

function updateSourceFields() {
	const source = selectedSource();
	document.querySelectorAll("[data-link-preview-source]").forEach((element) => {
		element.hidden = element.dataset.linkPreviewSource !== source;
	});
}

function updatePreview() {
	const source = selectedSource();
	const configuredImageUrl = imageUrl?.value.trim() || "";
	const image = source === "upload"
		? uploadState.path || configuredImageUrl || fallbackPreviewImage
		: configuredImageUrl || uploadState.path || fallbackPreviewImage;
	if (imagePreview) {
		imagePreview.hidden = false;
		if (imagePreview.getAttribute("src") !== image) imagePreview.src = image;
	}
	if (previewTitle) previewTitle.textContent = title?.value.trim() || "Preview title";
	if (previewDescription) previewDescription.textContent = description?.value.trim() || "Preview description will appear here.";
	if (previewUrl) previewUrl.textContent = url?.value.trim() || "https://example.com";
	if (imageMeta) imageMeta.textContent = source === "upload" ? formatMeta(uploadState.meta) : "";
}

function setSource(value) {
	const input = document.querySelector(`input[name="linkPreviewImageSource"][value="${value}"]`);
	if (input) input.checked = true;
	updateSourceFields();
	updatePreview();
}

function fillForm(settings) {
	if (!form) return;
	revokeUploadPreview();
	enabled.checked = Boolean(settings.enabled);
	title.value = settings.title || "";
	description.value = settings.description || "";
	url.value = settings.url || "";
	imageUrl.value = settings.imageUrl || "";
	uploadState = { path: settings.imagePath || "", file: null, meta: settings.imageMeta || null };
	setSource(settings.imageSource || "url");
}

function readImageDimensions(file) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		const objectUrl = URL.createObjectURL(file);
		image.onload = () => {
			URL.revokeObjectURL(objectUrl);
			resolve({ width: image.naturalWidth, height: image.naturalHeight });
		};
		image.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error("Selected image could not be previewed."));
		};
		image.src = objectUrl;
	});
}

async function ensureUploadedImage() {
	if (!uploadState.file) return uploadState;
	const uploaded = await uploadSettingQrImage(uploadState.file, "settings/link-preview");
	revokeUploadPreview();
	uploadState = {
		path: uploaded.path,
		file: null,
		meta: {
			name: uploadState.meta?.name || uploaded.name,
			type: uploaded.type,
			size: uploaded.size,
			width: uploadState.meta?.width || null,
			height: uploadState.meta?.height || null
		}
	};
	return uploadState;
}

async function loadSettings() {
	if (!form) return;
	try {
		fillForm(await getLinkPreviewSettings());
	} catch (error) {
		setMessage(`Link preview settings could not be loaded: ${error.message}`, "error");
	}
}

form?.addEventListener("submit", async (event) => {
	event.preventDefault();
	try {
		const source = selectedSource();
		const uploaded = source === "upload" ? await ensureUploadedImage() : uploadState;
		const saved = await saveLinkPreviewSettings({
			enabled: enabled.checked,
			title: title.value,
			description: description.value,
			url: url.value,
			imageSource: source,
			imageUrl: source === "url" ? imageUrl.value || null : null,
			imagePath: source === "upload" ? uploaded.path : null,
			imageMeta: source === "upload" ? uploaded.meta : null
		});
		fillForm(saved);
		setMessage("Link preview settings saved.", "success");
	} catch (error) {
		setMessage(error.message, "error");
	}
});

resetButton?.addEventListener("click", async () => {
	try {
		await deleteLinkPreviewSettings();
		await loadSettings();
		setMessage("Link preview settings reset.", "success");
	} catch (error) {
		setMessage(error.message, "error");
	}
});

imageFile?.addEventListener("change", async (event) => {
	const file = event.target.files?.[0];
	if (!file) return;
	try {
		const dimensions = await readImageDimensions(file);
		revokeUploadPreview();
		uploadState = {
			path: URL.createObjectURL(file),
			file,
			meta: { name: file.name, type: file.type, size: file.size, ...dimensions }
		};
		setSource("upload");
		updatePreview();
	} catch (error) {
		setMessage(error.message, "error");
	}
});

document.querySelectorAll('input[name="linkPreviewImageSource"]').forEach((input) => {
	input.addEventListener("change", () => {
		updateSourceFields();
		updatePreview();
	});
});
[title, description, url, imageUrl].forEach((input) => input?.addEventListener("input", updatePreview));

imagePreview?.addEventListener("error", () => {
	if (imagePreview.getAttribute("src") !== fallbackPreviewImage) imagePreview.src = fallbackPreviewImage;
});

loadSettings();
	}
}

new LinkPreviewAdminPage().initialize();
