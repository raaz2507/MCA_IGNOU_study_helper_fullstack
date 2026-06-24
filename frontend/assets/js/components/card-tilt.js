(() => {
	"use strict";

	const settings = {
		max: 5,
		perspective: 1400,
		scale: 1.012,
		speed: 500,
		easing: "cubic-bezier(.03,.98,.52,.99)"
	};

	function setTransition(card) {
		clearTimeout(card.tiltTransitionTimer);
		card.style.setProperty(
			"transition",
			`transform ${settings.speed}ms ${settings.easing}, box-shadow 250ms ease`,
			"important"
		);
		card.tiltTransitionTimer = setTimeout(() => {
			card.style.setProperty("transition", "box-shadow 250ms ease", "important");
		}, settings.speed);
	}

	function reset(card) {
		setTransition(card);
		card.style.setProperty(
			"transform",
			`perspective(${settings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
			"important"
		);
		card.classList.remove("is-tilting");
	}

	function initialize(card) {
		if (card.dataset.tiltReady === "true") return;
		card.dataset.tiltReady = "true";

		card.addEventListener("mouseenter", () => {
			card.classList.add("is-tilting");
			setTransition(card);
		});

		card.addEventListener("mousemove", (event) => {
			const bounds = card.getBoundingClientRect();
			const mouseX = event.clientX - bounds.left;
			const mouseY = event.clientY - bounds.top;
			const isExpanded = Boolean(
				card.querySelector('.books-toggle[aria-expanded="true"]')
			);
			const maxTilt = isExpanded ? 2.5 : settings.max;
			const scale = isExpanded ? 1.006 : settings.scale;
			const rotateY = ((mouseX / bounds.width) - 0.5) * maxTilt * 2;
			const rotateX = (0.5 - (mouseY / bounds.height)) * maxTilt * 2;

			card.style.setProperty(
				"transform",
				`perspective(${settings.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
				"important"
			);
			card.style.setProperty("--tilt-x", `${(mouseX / bounds.width) * 100}%`);
			card.style.setProperty("--tilt-y", `${(mouseY / bounds.height) * 100}%`);
		});

		card.addEventListener("mouseleave", () => reset(card));
	}

	function initializeCards() {
		document.querySelectorAll("#semesterContainer .card").forEach(initialize);
	}

	document.addEventListener("study-helper:subjects-rendered", initializeCards);
	initializeCards();
})();
