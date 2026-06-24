import { getVisibleBanners } from "../utils/banner-store.js";

const root = document.getElementById("announcementBanner");
let banners = [];
let activeIndex = 0;
let timer = null;
const AUTO_SLIDE_DELAY = 5000;

function safeLink(value) {
	const link = String(value || "").trim();
	if (!link) return "";
	if (/^(javascript|data|vbscript):/i.test(link) || /[\u0000-\u001f]/.test(link)) return "";
	return link;
}

function createSlide(banner, index) {
	const slide = document.createElement("article");
	slide.className = "announcement-slide";
	slide.setAttribute("aria-hidden", index === activeIndex ? "false" : "true");

	const image = document.createElement("img");
	image.className = "announcement-image";
	image.src = banner.image || "../assets/images/banner-exam.svg";
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
}

render();

