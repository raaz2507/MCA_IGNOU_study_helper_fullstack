const defaultShareSettings = {
	title: "Share GyanPath",
	description: "Share GyanPath with fellow IGNOU MCA students.",
	shareText: "GyanPath - IGNOU MCA study resources",
	url: "https://gyanpath.up.railway.app/",
	qrImageSource: "generated",
	qrImageUrl: "",
	qrImagePath: ""
};
const defaultSupportSettings = {
	enabled: false,
	title: "Support GyanPath",
	description: "Your donation helps keep IGNOU MCA resources organized, updated and free for students.",
	qrData: "",
	qrImageSource: "generated",
	qrImageUrl: "",
	qrImagePath: "",
	buttonText: "Donate Now",
	buttonUrl: ""
};

function selectConfiguredQrImage(settings) {
	if (settings.qrImageSource === "generated" && settings.qrImagePath) return settings.qrImagePath;
	if (settings.qrImageSource === "upload" && settings.qrImagePath) return settings.qrImagePath;
	if (settings.qrImageSource === "url" && settings.qrImageUrl) return settings.qrImageUrl;
	return "";
}

function displayQrImageWithFallback(qrImageElement, configuredImageUrl) {
	if (!qrImageElement) return;
	const fallbackDataUrl = qrImageElement.dataset.qrFallbackSrc || "";
	const fallbackAlternativeText = qrImageElement.dataset.qrFallbackAlt || qrImageElement.alt;
	const preferredImageUrl = configuredImageUrl || fallbackDataUrl;
	qrImageElement.hidden = !preferredImageUrl;
	if (!preferredImageUrl) return;

	qrImageElement.onerror = () => {
		if (!fallbackDataUrl || qrImageElement.src === fallbackDataUrl) {
			qrImageElement.hidden = true;
			return;
		}
		qrImageElement.src = fallbackDataUrl;
		qrImageElement.alt = fallbackAlternativeText;
		qrImageElement.hidden = false;
	};
	qrImageElement.src = preferredImageUrl;
	if (!configuredImageUrl) qrImageElement.alt = fallbackAlternativeText;
}

function updateShareLinks(container, settings) {
	const share = { ...defaultShareSettings, ...settings };
	const title = container.querySelector("#shareGyanPathTitle");
	const description = container.querySelector("[data-share-description]");
	const qr = container.querySelector("[data-share-qr]");
	const whatsapp = container.querySelector("[data-share-whatsapp]");
	const telegram = container.querySelector("[data-share-telegram]");
	const message = `${share.shareText}: ${share.url}`;

	if (title) title.textContent = share.title;
	if (description) description.textContent = share.description;
	displayQrImageWithFallback(qr, selectConfiguredQrImage(share));
	if (whatsapp) whatsapp.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
	if (telegram) telegram.href = `https://t.me/share/url?url=${encodeURIComponent(share.url)}&text=${encodeURIComponent(share.shareText)}`;
}

function updateSupportSection(container, settings) {
	const support = { ...defaultSupportSettings, ...settings };
	const section = container.querySelector("[data-support-section]");
	const title = container.querySelector("#donationTitle");
	const description = container.querySelector("[data-support-description]");
	const qr = container.querySelector("[data-support-qr]");
	const action = container.querySelector("[data-support-action]");
	if (!section) return;

	section.hidden = !support.enabled;
	if (title) title.textContent = support.title;
	if (description) description.textContent = support.description;
	displayQrImageWithFallback(qr, selectConfiguredQrImage(support));
	if (action) {
		action.textContent = support.buttonText || defaultSupportSettings.buttonText;
		if (support.upiId) action.dataset.upiId = support.upiId;
		else action.removeAttribute("data-upi-id");
		if (support.buttonUrl) {
			action.href = support.buttonUrl;
			action.className = "donation-button";
			action.removeAttribute("aria-disabled");
		} else {
			action.removeAttribute("href");
			action.className = "donation-button donation-button-disabled";
			action.setAttribute("aria-disabled", "true");
		}
	}
}

function upiIdFromAction(action) {
	if (action?.dataset.upiId) return action.dataset.upiId;
	const href = action?.getAttribute("href") || "";
	if (!href.toLowerCase().startsWith("upi://")) return "";
	try {
		return new URL(href).searchParams.get("pa") || "";
	} catch {
		return "";
	}
}

function isLikelyMobileDevice() {
	return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
		|| (navigator.maxTouchPoints > 1 && window.innerWidth <= 1024);
}

async function copyText(value) {
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(value);
		return;
	}
	const field = document.createElement("textarea");
	field.value = value;
	field.setAttribute("readonly", "");
	field.style.position = "fixed";
	field.style.opacity = "0";
	document.body.append(field);
	field.select();
	document.execCommand("copy");
	field.remove();
}

function enhanceDonationDialog(container) {
	const action = container.querySelector("[data-support-action]");
	const dialog = container.querySelector("[data-donation-dialog]");
	const close = dialog?.querySelector("[data-donation-close]");
	const dialogQr = dialog?.querySelector("[data-donation-dialog-qr]");
	const footerQr = container.querySelector("[data-support-qr]");
	const upiRow = dialog?.querySelector("[data-donation-upi-row]");
	const upiText = dialog?.querySelector("[data-donation-upi-id]");
	const copy = dialog?.querySelector("[data-donation-copy]");
	const status = dialog?.querySelector("[data-donation-copy-status]");
	if (!action || !dialog || action.dataset.dialogEnhanced === "true") return;
	action.dataset.dialogEnhanced = "true";

	action.addEventListener("click", (event) => {
		if (action.getAttribute("aria-disabled") === "true" || isLikelyMobileDevice()) return;
		event.preventDefault();
		const upiId = upiIdFromAction(action);
		if (dialogQr && footerQr?.src) dialogQr.src = footerQr.src;
		if (upiText) upiText.textContent = upiId;
		if (upiRow) upiRow.hidden = !upiId;
		if (status) status.textContent = "";
		dialog.showModal();
	});

	close?.addEventListener("click", () => dialog.close());
	dialog.addEventListener("click", (event) => {
		if (event.target === dialog) dialog.close();
	});
	copy?.addEventListener("click", async () => {
		const upiId = upiIdFromAction(action);
		if (!upiId) return;
		try {
			await copyText(upiId);
			if (status) status.textContent = "UPI ID copied.";
		} catch {
			if (status) status.textContent = "Could not copy automatically. Select the UPI ID above.";
		}
	});
}

export function enhanceFooter(container) {
	if (!container) return;

	const hasServerMarkup = Boolean(container.querySelector(".site-footer"));
	if (!hasServerMarkup) return;
	enhanceDonationDialog(container);
	fetch("/api/share-settings")
		.then((response) => response.ok ? response.json() : null)
		.then((settings) => {
			if (settings) updateShareLinks(container, settings);
		})
		.catch(() => {});
	fetch("/api/support-settings")
		.then((response) => response.ok ? response.json() : null)
		.then((settings) => {
			if (settings) updateSupportSection(container, settings);
		})
		.catch(() => {});
}
