/**
 * Study Material UI Enhancer
 * Manages collapsible study material blocks and PDF viewer link transformations.
 */

export function initStudyMaterial() {
	// Transform [data-pdf-en] links to internal PDF viewer URLs
	document.querySelectorAll("a[data-pdf-en]").forEach((link) => {
		const params = new URLSearchParams({
			en: link.dataset.pdfEn,
			title: link.dataset.title || link.textContent.trim()
		});

		if (link.dataset.pdfHi) {
			params.set("hi", link.dataset.pdfHi);
		}

		link.href = `/pdf-viewer?${params.toString()}`;
		link.target = "_blank";
		link.rel = "noopener";
	});

	// Collapsible block toggles
	function initializeStudyMaterialToggles() {
		document.querySelectorAll(".books").forEach((books, index) => {
			if (books.querySelector(":scope > .books-toggle")) return;

			const blocks = [...books.querySelectorAll(":scope > section")];
			if (!blocks.length) return;

			const unitCount = blocks.reduce(
				(total, block) => total + block.querySelectorAll("a").length,
				0
			);
			const contentId = `bookBlocks-${index + 1}`;
			const content = document.createElement("div");
			content.id = contentId;
			content.className = "book-blocks";
			content.hidden = true;
			blocks.forEach((block) => content.append(block));

			const button = document.createElement("button");
			button.className = "books-toggle";
			button.type = "button";
			button.setAttribute("aria-expanded", "false");
			button.setAttribute("aria-controls", contentId);
			button.innerHTML = `
				<span>
					<strong>📚 Study Material</strong>
					<small>${blocks.length} Blocks • ${unitCount} Units</small>
				</span>
				<span class="toggle-label">Expand</span>
				<span class="toggle-icon" aria-hidden="true"></span>
			`;

			button.addEventListener("click", () => {
				const willExpand = button.getAttribute("aria-expanded") !== "true";
				button.setAttribute("aria-expanded", String(willExpand));
				content.hidden = !willExpand;
				button.querySelector(".toggle-label").textContent =
					willExpand ? "Collapse" : "Expand";
			});

			books.classList.add("is-collapsible");
			books.prepend(button);
			books.append(content);
		});
	}

	initializeStudyMaterialToggles();
	document.addEventListener(
		"study-helper:subjects-rendered",
		initializeStudyMaterialToggles
	);
}
