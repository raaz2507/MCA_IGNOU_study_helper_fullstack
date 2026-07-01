const buttons = [...document.querySelectorAll("[data-guide-language]")];
const contents = [...document.querySelectorAll("[data-guide-content]")];
const label = document.querySelector("[data-guide-language-label]");
const captions = { en: document.querySelector("[data-guide-caption-en]"), hi: document.querySelector("[data-guide-caption-hi]") };
const guideNav = document.querySelector("[data-user-guide-nav]");
const guideNavTitle = document.querySelector("[data-user-guide-nav-title]");

function divideIntoSections(content) {
	const headings = [...content.children].filter((item) => item.tagName === "H2");
	headings.forEach((heading, index) => {
		const section = document.createElement("section");
		section.className = "info-card guide-section";
		section.id = `${content.dataset.guideContent}-guide-section-${index + 1}`;
		content.insertBefore(section, heading);
		section.append(heading);
		while (section.nextElementSibling && section.nextElementSibling.tagName !== "H2" && !section.nextElementSibling.matches("[data-role-guide-section]")) {
			section.append(section.nextElementSibling);
		}
	});
}

contents.forEach(divideIntoSections);

function renderGuideNavigation(selected) {
	if (!guideNav) return;
	guideNav.replaceChildren();
	const content = contents.find((item) => item.dataset.guideContent === selected);
	content?.querySelectorAll(":scope > .guide-section").forEach((section) => {
		const heading = section.querySelector("h2");
		if (!heading) return;
		const link = document.createElement("a");
		link.href = `#${section.id}`;
		link.textContent = heading.textContent;
		guideNav.append(link);
	});
	const roleSection = content?.querySelector("[data-role-guide-section]");
	if (roleSection && !roleSection.hidden) {
		roleSection.id ||= `${selected}-role-guides`;
		const link = document.createElement("a");
		link.href = `#${roleSection.id}`;
		link.textContent = roleSection.querySelector("h2")?.textContent || "Role Guides";
		guideNav.append(link);
	}
}

function setLanguage(language) {
	const selected = language === "hi" ? "hi" : "en";
	contents.forEach((content) => { content.hidden = content.dataset.guideContent !== selected; });
	buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.guideLanguage === selected)));
	Object.entries(captions).forEach(([key, caption]) => { if (caption) caption.hidden = key !== selected; });
	if (label) label.textContent = selected === "hi" ? "Guide की भाषा" : "Guide language";
	document.documentElement.lang = selected;
	if (guideNavTitle) guideNavTitle.textContent = selected === "hi" ? "Guide के Sections" : "Guide Sections";
	renderGuideNavigation(selected);
	localStorage.setItem("gyanpath-guide-language", selected);
}

buttons.forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.guideLanguage)));
setLanguage(localStorage.getItem("gyanpath-guide-language") || "en");

function revealAvailableRoleGuideSections() {
	document.querySelectorAll("[data-role-guide-section]").forEach((section) => {
		section.hidden = !section.querySelector('[data-visible-for]:not([hidden])');
	});
	renderGuideNavigation(localStorage.getItem("gyanpath-guide-language") === "hi" ? "hi" : "en");
}

const roleVisibilityObserver = new MutationObserver(revealAvailableRoleGuideSections);
document.querySelectorAll("[data-role-guide-section] [data-visible-for]").forEach((item) => {
	roleVisibilityObserver.observe(item, { attributes: true, attributeFilter: ["hidden"] });
});
revealAvailableRoleGuideSections();
