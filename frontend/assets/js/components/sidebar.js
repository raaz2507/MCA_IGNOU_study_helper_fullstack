/**
 * Section Sidebar Navigation Component
 * Builds dynamic table of contents, disclosure toggles, mobile drawer, and active section tracker.
 */

function createSectionId(text, fallback) {
	const slug = text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return slug || fallback;
}

export function buildSidebar() {
	if (document.getElementById("pageSidebar")) return;
	const pageSections = [
		...document.querySelectorAll(
			"#semesterContainer > section.semester, main > section.program-guide, main > section.assignments"
		)
	];

	if (!pageSections.length) return;

	const menuButton = document.createElement("button");
	menuButton.type = "button";
	menuButton.className = "sidebar-toggle";
	menuButton.setAttribute("aria-label", "Open section menu");
	menuButton.setAttribute("aria-expanded", "false");
	menuButton.setAttribute("aria-controls", "pageSidebar");
	menuButton.innerHTML =
		'<span class="sidebar-menu-icon" aria-hidden="true"><i></i><i></i><i></i></span><span>Sections</span>';

	const overlay = document.createElement("button");
	overlay.type = "button";
	overlay.className = "sidebar-overlay";
	overlay.setAttribute("aria-label", "Close section menu");

	const sidebar = document.createElement("aside");
	sidebar.id = "pageSidebar";
	sidebar.className = "page-sidebar";
	sidebar.setAttribute("aria-label", "Page sections");
	sidebar.innerHTML = `
		<div class="sidebar-heading">
			<strong>Contents</strong>
			<button type="button" class="sidebar-close" aria-label="Close section menu"><span aria-hidden="true"></span></button>
		</div>
		<nav class="sidebar-nav"></nav>
	`;

	const nav = sidebar.querySelector(".sidebar-nav");
	const observedSections = [];

	pageSections.forEach((section, sectionIndex) => {
		const heading = section.querySelector(":scope > h2");
		if (!heading) return;

		const title = heading.textContent.trim();
		section.id ||= createSectionId(title, `section-${sectionIndex + 1}`);

		const group = document.createElement("div");
		group.className = "sidebar-group";

		const mainLink = document.createElement("a");
		mainLink.className = "sidebar-link sidebar-main-link";
		mainLink.href = `#${section.id}`;
		mainLink.textContent = title;
		const mainRow = document.createElement("div");
		mainRow.className = "sidebar-disclosure-row";
		mainRow.append(mainLink);
		group.append(mainRow);
		observedSections.push(section);

		const childSections = [
			...section.querySelectorAll(
				":scope > section.theory, :scope > section.prectical, :scope > section.practical, :scope > section.assignments"
			)
		];

		if (childSections.length) {
			const childNav = document.createElement("div");
			childNav.className = "sidebar-subnav";
			childNav.id = `${section.id}-sidebar-items`;

			const semesterToggle = document.createElement("button");
			semesterToggle.type = "button";
			semesterToggle.className = "sidebar-disclosure-toggle";
			semesterToggle.setAttribute("aria-label", `Collapse ${title}`);
			semesterToggle.setAttribute("aria-expanded", "true");
			semesterToggle.setAttribute("aria-controls", childNav.id);
			semesterToggle.innerHTML = '<span aria-hidden="true"></span>';
			mainRow.append(semesterToggle);

			childSections.forEach((child, childIndex) => {
				const childHeading = child.querySelector(":scope > h2");
				const className = child.classList.contains("assignments")
					? "Assignments"
					: child.classList.contains("theory")
						? "Theory Papers"
						: "Practical Papers";
				const childTitle = childHeading?.textContent.trim() || className;

				child.id ||= `${section.id}-${createSectionId(
					className,
					`part-${childIndex + 1}`
				)}`;

				const childLink = document.createElement("a");
				childLink.className = "sidebar-link sidebar-sub-link";
				childLink.href = `#${child.id}`;
				childLink.textContent = childTitle;
				const childRow = document.createElement("div");
				childRow.className = "sidebar-disclosure-row sidebar-category-row";
				childRow.append(childLink);
				childNav.append(childRow);
				observedSections.push(child);

				const subjectCards = [
					...child.querySelectorAll(":scope > .cardContainer > .card")
				];

				if (subjectCards.length) {
					const subjectNav = document.createElement("div");
					subjectNav.className = "sidebar-subnav sidebar-subject-nav";
					subjectNav.id = `${child.id}-sidebar-subjects`;

					const categoryToggle = document.createElement("button");
					categoryToggle.type = "button";
					categoryToggle.className = "sidebar-disclosure-toggle";
					categoryToggle.setAttribute("aria-label", `Collapse ${childTitle}`);
					categoryToggle.setAttribute("aria-expanded", "true");
					categoryToggle.setAttribute("aria-controls", subjectNav.id);
					categoryToggle.innerHTML = '<span aria-hidden="true"></span>';
					childRow.append(categoryToggle);

					subjectCards.forEach((card, cardIndex) => {
						const code = card.querySelector(":scope > h3")?.textContent.trim();
						const name = card.querySelector(":scope > p")?.textContent.trim();
						const labels = [code, name].filter(Boolean);
						const subjectTitle = [...new Set(labels)].join(" — ");
						if (!subjectTitle) return;

						card.id ||= `${child.id}-${createSectionId(
							code || name,
							`subject-${cardIndex + 1}`
						)}`;

						const subjectLink = document.createElement("a");
						subjectLink.className =
							"sidebar-link sidebar-sub-link sidebar-subject-link";
						subjectLink.href = `#${card.id}`;
						subjectLink.textContent = subjectTitle;
						subjectNav.append(subjectLink);
						observedSections.push(card);
					});

					childNav.append(subjectNav);
				}
			});

			group.append(childNav);
		}

		const directCards = [
			...section.querySelectorAll(":scope > .cardContainer > .card")
		];

		if (!childSections.length && directCards.length) {
			const resourceNav = document.createElement("div");
			resourceNav.className = "sidebar-subnav sidebar-subject-nav";
			resourceNav.id = `${section.id}-sidebar-resources`;

			const resourceToggle = document.createElement("button");
			resourceToggle.type = "button";
			resourceToggle.className = "sidebar-disclosure-toggle";
			resourceToggle.setAttribute("aria-label", `Collapse ${title}`);
			resourceToggle.setAttribute("aria-expanded", "true");
			resourceToggle.setAttribute("aria-controls", resourceNav.id);
			resourceToggle.innerHTML = '<span aria-hidden="true"></span>';
			mainRow.append(resourceToggle);

			directCards.forEach((card, cardIndex) => {
				const resourceTitle = card.querySelector(":scope > h3")?.textContent.trim();
				if (!resourceTitle) return;

				card.id ||= `${section.id}-${createSectionId(
					resourceTitle,
					`resource-${cardIndex + 1}`
				)}`;

				const resourceLink = document.createElement("a");
				resourceLink.className =
					"sidebar-link sidebar-sub-link sidebar-subject-link sidebar-resource-link";
				resourceLink.href = `#${card.id}`;
				resourceLink.textContent = resourceTitle;
				resourceNav.append(resourceLink);
				observedSections.push(card);
			});

			group.append(resourceNav);
		}

		nav.append(group);
	});

	const semesterContainer = document.getElementById("semesterContainer");
	const programGuide = document.querySelector("main > .program-guide");
	const assignments = document.querySelector("main > .assignments");
	const contentLayout = document.createElement("div");
	contentLayout.className = "page-content-layout";
	const contentColumn = document.createElement("div");
	contentColumn.className = "page-content-column";

	semesterContainer.before(menuButton, contentLayout);
	contentLayout.append(sidebar, contentColumn);
	contentColumn.append(semesterContainer);
	if (programGuide) contentColumn.append(programGuide);
	if (assignments) contentColumn.append(assignments);
	document.body.append(overlay);
	document.body.classList.add("has-page-sidebar");

	const closeSidebar = () => {
		document.body.classList.remove("sidebar-open");
		document.body.classList.remove("sidebar-scroll-locked");
		menuButton.setAttribute("aria-expanded", "false");
		menuButton.setAttribute("aria-label", "Open section menu");
	};

	const openSidebar = () => {
		document.body.classList.add("sidebar-open");
		if (window.innerWidth <= 900) {
			document.body.classList.add("sidebar-scroll-locked");
		}
		menuButton.setAttribute("aria-expanded", "true");
		menuButton.setAttribute("aria-label", "Close section menu");
	};

	menuButton.addEventListener("click", () => {
		document.body.classList.contains("sidebar-open")
			? closeSidebar()
			: openSidebar();
	});
	overlay.addEventListener("click", closeSidebar);
	sidebar.querySelector(".sidebar-close").addEventListener("click", closeSidebar);
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && document.body.classList.contains("sidebar-open")) {
			closeSidebar();
			menuButton.focus();
		}
	});

	sidebar.querySelectorAll(".sidebar-disclosure-toggle").forEach((toggle) => {
		toggle.addEventListener("click", () => {
			const target = document.getElementById(toggle.getAttribute("aria-controls"));
			if (!target) return;
			const willExpand = toggle.getAttribute("aria-expanded") !== "true";
			toggle.setAttribute("aria-expanded", String(willExpand));
			toggle.setAttribute(
				"aria-label",
				`${willExpand ? "Collapse" : "Expand"} ${toggle
					.closest(".sidebar-disclosure-row")
					?.querySelector(".sidebar-link")
					?.textContent.trim() || "section"}`
			);
			target.hidden = !willExpand;
		});
	});

	const sidebarLinks = [...nav.querySelectorAll(".sidebar-link")];
	sidebarLinks.forEach((link) => link.addEventListener("click", closeSidebar));

	let ticking = false;
	const updateActiveLink = () => {
		const triggerThreshold = 180;
		let currentSection = null;

		for (const section of observedSections) {
			const rect = section.getBoundingClientRect();
			if (rect.top <= triggerThreshold && rect.bottom > 40) {
				currentSection = section;
			}
		}

		if (!currentSection && observedSections.length) {
			const firstRect = observedSections[0].getBoundingClientRect();
			if (firstRect.top > triggerThreshold) {
				currentSection = observedSections[0];
			} else {
				let closestDistance = Infinity;
				for (const section of observedSections) {
					const rect = section.getBoundingClientRect();
					const dist = Math.abs(rect.top - triggerThreshold);
					if (dist < closestDistance) {
						closestDistance = dist;
						currentSection = section;
					}
				}
			}
		}

		sidebarLinks.forEach((link) => {
			const isActive = link.getAttribute("href") === `#${currentSection?.id}`;
			link.classList.toggle("active", isActive);
			if (isActive) {
				link.setAttribute("aria-current", "location");
				let parentNav = link.closest(".sidebar-subnav");
				while (parentNav) {
					if (parentNav.hidden) {
						parentNav.hidden = false;
						const toggle = sidebar.querySelector(`[aria-controls="${parentNav.id}"]`);
						if (toggle) {
							toggle.setAttribute("aria-expanded", "true");
						}
					}
					parentNav = parentNav.parentElement?.closest(".sidebar-subnav");
				}
			} else {
				link.removeAttribute("aria-current");
			}
		});
	};

	window.addEventListener("scroll", () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				updateActiveLink();
				ticking = false;
			});
			ticking = true;
		}
	}, { passive: true });
	window.addEventListener("resize", () => {
		if (window.innerWidth > 900) closeSidebar();
		updateActiveLink();
	});
	updateActiveLink();
}

export function initSectionSidebar() {
	function tryBuildSidebar() {
		const subjectsReady = Boolean(
			document.querySelector("#semesterContainer > section.semester")
		);
		const collectionsReady =
			document.body.dataset.page !== "resources" ||
			document.body.dataset.resourceCollectionsReady === "true";

		if (!subjectsReady || !collectionsReady) return false;
		buildSidebar();
		return true;
	}

	if (!tryBuildSidebar()) {
		document.addEventListener("study-helper:subjects-rendered", tryBuildSidebar, { once: true });
		document.addEventListener(
			"study-helper:resource-collections-rendered",
			tryBuildSidebar,
			{ once: true }
		);
	}
}
