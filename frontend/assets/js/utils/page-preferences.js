import { initStudyMaterial } from "../components/study-material.js";
import { initSectionSidebar } from "../components/sidebar.js";

/**
 * PagePreferences
 * Clean, focused manager for user visual themes and academic program preferences.
 */
export class PagePreferences {
	constructor() {
		this.initialize();
	}

	initialize() {
		this.initTheme();
		this.initProgram();
	}

	initTheme() {
		const themes = Array.isArray(window.STUDY_HELPER_THEMES)
			? window.STUDY_HELPER_THEMES
			: [{ id: "sepia", label: "◐ Sepia" }];
		const allowedThemes = themes.map((theme) => theme.id);
		const savedTheme = localStorage.getItem("study-helper-theme");
		const initialTheme = allowedThemes.includes(savedTheme) ? savedTheme : "sepia";
		const themeSwitcher = document.querySelector(".theme-switcher");

		if (themeSwitcher) {
			themeSwitcher.replaceChildren();
			themes.forEach((theme) => {
				const button = document.createElement("button");
				button.type = "button";
				button.className = "theme-option";
				button.dataset.theme = theme.id;
				button.textContent = theme.label;
				themeSwitcher.append(button);
			});
		}

		function setTheme(theme) {
			const selectedTheme = allowedThemes.includes(theme) ? theme : "sepia";
			document.documentElement.dataset.theme = selectedTheme;
			localStorage.setItem("study-helper-theme", selectedTheme);
			document.querySelectorAll(".theme-option").forEach((button) => {
				const isActive = button.dataset.theme === selectedTheme;
				button.classList.toggle("active", isActive);
				button.setAttribute("aria-pressed", String(isActive));
			});
		}

		document.querySelectorAll(".theme-option").forEach((button) => {
			button.addEventListener("click", () => setTheme(button.dataset.theme));
		});
		setTheme(initialTheme);
	}

	initProgram() {
		const programSelector = document.getElementById("programSelector");
		if (!programSelector) return;

		programSelector.addEventListener("change", (event) => {
			const selectedCode = event.target.value;
			localStorage.setItem("study-helper-program", selectedCode);
			document.cookie = `study_helper_program=${encodeURIComponent(selectedCode)}; path=/; max-age=31536000; SameSite=Lax`;

			const currentUrl = new URL(window.location.href);
			if (currentUrl.pathname === "/resources") {
				currentUrl.searchParams.set("program", selectedCode);
				window.location.href = currentUrl.toString();
			} else {
				window.location.href = `/resources?program=${encodeURIComponent(selectedCode)}`;
			}
		});
	}
}

// Auto-initialize preferences & UI components on module import
new PagePreferences();
initStudyMaterial();
initSectionSidebar();
