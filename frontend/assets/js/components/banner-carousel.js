import { getVisibleBanners } from "../utils/banner-store.js";
import { closeModal, openModal } from "./modal.js";

const root = document.getElementById("announcementBanner");
const detailsDialog = document.getElementById("announcementDetailsDialog");
const detailsClose = document.getElementById("announcementDetailsClose");
const detailsDismiss = document.getElementById("announcementDetailsDismiss");
let banners = [];
let activeIndex = 0;
let timer = null;
let openedBanner = null;
const AUTO_SLIDE_DELAY = 5000;

function safeLink(value) {
	const link = String(value || "").trim();
	if (!link) return "";
	if (/^(javascript|data|vbscript):/i.test(link) || /[\u0000-\u001f]/.test(link)) return "";
	return link;
}

function formatDate(value) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("en-IN", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC"
	}).format(date);
}

function bannerUrl(banner) {
	const url = new URL(window.location.href);
	url.searchParams.set("banner", banner.id);
	return url.toString();
}

function clearBannerUrl() {
	const url = new URL(window.location.href);
	if (!url.searchParams.has("banner")) return;
	url.searchParams.delete("banner");
	window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function showBannerDetails(banner, updateUrl = true) {
	if (!detailsDialog) return;
	openedBanner = banner;
	const link = safeLink(banner.buttonUrl);
	const action = detailsDialog.querySelector("[data-details-action]");
	const start = detailsDialog.querySelector("[data-details-start]");
	const end = detailsDialog.querySelector("[data-details-end]");

	detailsDialog.querySelector("[data-details-image]").src = banner.image || "/assets/images/fallback_images/banner-exam.svg";
	detailsDialog.querySelector("[data-details-category]").textContent = banner.category;
	detailsDialog.querySelector("[data-details-title]").textContent = banner.title;
	detailsDialog.querySelector("[data-details-description]").textContent = banner.description;
	start.hidden = !banner.startDate;
	end.hidden = !banner.endDate;
	start.querySelector("dd").textContent = formatDate(banner.startDate);
	end.querySelector("dd").textContent = formatDate(banner.endDate);
	detailsDialog.querySelector("[data-details-dates]").hidden = !banner.startDate && !banner.endDate;

	action.hidden = !link;
	if (link) {
		action.href = link;
		action.textContent = banner.buttonText || "View details";
		action.target = /^https?:\/\//i.test(link) ? "_blank" : "_self";
		action.rel = action.target === "_blank" ? "noopener noreferrer" : "";
	}
	const shareUrl = bannerUrl(banner);
	const shareText = `${banner.title} — ${banner.description}`;
	const whatsapp = detailsDialog.querySelector("[data-banner-whatsapp]");
	const telegram = detailsDialog.querySelector("[data-banner-telegram]");
	whatsapp.href = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
	telegram.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
	if (updateUrl) window.history.pushState({ banner: banner.id }, "", new URL(shareUrl).pathname + new URL(shareUrl).search);

	window.clearInterval(timer);
	openModal(detailsDialog);
}

function createSlide(banner, index) {
	const slide = document.createElement("article");
	slide.className = "announcement-slide";
	slide.setAttribute("aria-hidden", index === activeIndex ? "false" : "true");
	slide.setAttribute("role", "button");
	slide.setAttribute("aria-haspopup", "dialog");
	slide.setAttribute("aria-label", `View details for ${banner.title}`);
	slide.tabIndex = index === activeIndex ? 0 : -1;
	slide.inert = index !== activeIndex;
	slide.addEventListener("click", (event) => {
		if (!event.target.closest("a")) showBannerDetails(banner);
	});
	slide.addEventListener("keydown", (event) => {
		if (event.target.closest("a")) return;
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			showBannerDetails(banner);
		}
	});

	const image = document.createElement("img");
	image.className = "announcement-image";
	image.src = banner.image || "/assets/images/fallback_images/banner-exam.svg";
	image.alt = "";

	const shade = document.createElement("div");
	shade.className = "announcement-shade";

	const content = document.createElement("div");
	content.className = "announcement-content";
	const category = document.createElement("span");
	category.className = "announcement-category";
	category.textContent = banner.category;
	const title = document.createElement("h2");
	title.textContent = banner.title;
	const description = document.createElement("p");
	description.textContent = banner.description;
	content.append(category, title, description);

	const link = safeLink(banner.buttonUrl);
	if (banner.buttonText && link) {
		const button = document.createElement("a");
		button.className = "announcement-action";
		button.href = link;
		button.textContent = banner.buttonText;
		if (/^https?:\/\//i.test(link)) {
			button.target = "_blank";
			button.rel = "noopener noreferrer";
		}
		content.append(button);
	}

	slide.append(image, shade, content);
	return slide;
}

function showSlide(index, restart = true) {
	if (!banners.length) return;
	activeIndex = (index + banners.length) % banners.length;
	root.querySelectorAll(".announcement-slide").forEach((slide, slideIndex) => {
		const isActive = slideIndex === activeIndex;
		slide.classList.toggle("is-active", isActive);
		slide.setAttribute("aria-hidden", String(!isActive));
		slide.tabIndex = isActive ? 0 : -1;
		slide.inert = !isActive;
	});
	root.querySelectorAll(".announcement-dot").forEach((dot, dotIndex) => {
		const isActive = dotIndex === activeIndex;
		dot.classList.toggle("is-active", isActive);
		dot.setAttribute("aria-current", isActive ? "true" : "false");
	});
	if (restart) startTimer();
}

function startTimer() {
	window.clearInterval(timer);
	if (banners.length < 2 || document.hidden) return;
	timer = window.setInterval(() => {
		showSlide(activeIndex + 1, false);
	}, AUTO_SLIDE_DELAY);
}

async function render() {
	if (!root) return;
	banners = await getVisibleBanners();
	root.replaceChildren();
	if (!banners.length) {
		root.hidden = true;
		return;
	}
	root.hidden = false;

	const viewport = document.createElement("div");
	viewport.className = "announcement-viewport";
	banners.forEach((banner, index) => viewport.append(createSlide(banner, index)));
	root.append(viewport);

	if (banners.length > 1) {
		const previous = document.createElement("button");
		previous.type = "button";
		previous.className = "announcement-arrow announcement-previous";
		previous.setAttribute("aria-label", "Previous announcement");
		previous.innerHTML = '<span aria-hidden="true"></span>';
		previous.addEventListener("click", () => showSlide(activeIndex - 1));

		const next = document.createElement("button");
		next.type = "button";
		next.className = "announcement-arrow announcement-next";
		next.setAttribute("aria-label", "Next announcement");
		next.innerHTML = '<span aria-hidden="true"></span>';
		next.addEventListener("click", () => showSlide(activeIndex + 1));

		const dots = document.createElement("div");
		dots.className = "announcement-dots";
		dots.setAttribute("aria-label", "Choose announcement");
		banners.forEach((banner, index) => {
			const dot = document.createElement("button");
			dot.type = "button";
			dot.className = "announcement-dot";
			dot.setAttribute("aria-label", `Show ${banner.title}`);
			dot.addEventListener("click", () => showSlide(index));
			dots.append(dot);
		});
		root.append(previous, next, dots);
	}

	document.addEventListener("visibilitychange", () => {
		if (document.hidden) window.clearInterval(timer);
		else startTimer();
	});
	showSlide(0);
	const requestedBannerId = new URLSearchParams(window.location.search).get("banner");
	if (requestedBannerId) {
		const requestedIndex = banners.findIndex((banner) => banner.id === requestedBannerId);
		if (requestedIndex >= 0) {
			showSlide(requestedIndex, false);
			showBannerDetails(banners[requestedIndex], false);
		} else {
			const message = document.createElement("p");
			message.className = "announcement-deep-link-message";
			message.textContent = "The shared announcement is unavailable or no longer active.";
			root.prepend(message);
			clearBannerUrl();
		}
	}
}

render();

if (detailsDialog) {
	detailsClose?.addEventListener("click", () => closeModal(detailsDialog));
	detailsDismiss?.addEventListener("click", () => closeModal(detailsDialog));
	detailsDialog.addEventListener("click", (event) => {
		if (event.target === detailsDialog) closeModal(detailsDialog);
	});
	detailsDialog.addEventListener("close", startTimer);
	detailsDialog.addEventListener("close", () => { openedBanner = null; clearBannerUrl(); });
	detailsDialog.querySelector("[data-banner-copy]")?.addEventListener("click", async (event) => {
		if (!openedBanner) return;
		await navigator.clipboard.writeText(bannerUrl(openedBanner));
		event.currentTarget.textContent = "Copied";
		window.setTimeout(() => { event.currentTarget.textContent = "Copy Link"; }, 1600);
	});
	detailsDialog.querySelector("[data-banner-share]")?.addEventListener("click", async () => {
		if (!openedBanner) return;
		const data = { title: openedBanner.title, text: openedBanner.description, url: bannerUrl(openedBanner) };
		if (navigator.share) await navigator.share(data);
		else await navigator.clipboard.writeText(data.url);
	});
}
