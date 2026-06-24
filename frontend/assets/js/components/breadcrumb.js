const LABELS = {
	home: "Home",
	resources: "Resources",
	about: "About",
	"user-guide": "User Guide",
	dashboard: "Dashboard",
	"study-materials": "Study Materials",
	"question-papers": "Question Papers",
	admin: "Admin",
	profile: "Profile",
	discussion: "Discussions",
	chat: "Chat",
	"question-bank": "Question Bank",
	"paper-gallery": "Question Papers",
	"pdf-viewer": "PDF Viewer",
	"video-lectures": "Video Lectures"
};

const NON_LINKABLE = new Set(["pdf-viewer"]);

function labelFor(segment) {
	if (LABELS[segment]) return LABELS[segment];
	return segment
		.split("-")
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function subjectLabel() {
	const value = new URLSearchParams(window.location.search).get("subject");
	if (!value) return "";
	const tail = value.split("/").filter(Boolean).pop() || value;
	return tail.replaceAll("_", "-").toUpperCase();
}

function documentLabel() {
	return new URLSearchParams(window.location.search).get("title") || "";
}

function pathItems() {
	const items = [{ label: "Home", href: "/" }];
	const segments = window.location.pathname.split("/").filter(Boolean);
	let href = "";

	segments.forEach((segment, index) => {
		href += `/${segment}`;
		const isLast = index === segments.length - 1;
		items.push({
			label: labelFor(segment),
			href: isLast || NON_LINKABLE.has(segment) ? "" : href
		});
	});

	return items;
}

function itemsFor(page) {
	const items = pathItems();
	const subject = subjectLabel();
	if (subject && ["question-bank", "paper-gallery", "video-lectures"].includes(page)) {
		items.push({ label: subject, href: "" });
	}
	if (page === "pdf-viewer" && documentLabel()) {
		items.push({ label: documentLabel(), href: "" });
	}
	return items;
}

export function renderBreadcrumb(page = "") {
	if (!page || ["home", "login", "access-denied"].includes(page)) return;
	if (document.querySelector(".breadcrumb")) return;

	const nav = document.createElement("nav");
	nav.className = "breadcrumb";
	nav.setAttribute("aria-label", "Breadcrumb");
	const list = document.createElement("ol");

	itemsFor(page).forEach((item, index, items) => {
		const entry = document.createElement("li");
		if (item.href && index < items.length - 1) {
			const link = document.createElement("a");
			link.href = item.href;
			link.textContent = item.label;
			entry.append(link);
		} else {
			entry.textContent = item.label;
			entry.setAttribute("aria-current", "page");
		}
		list.append(entry);
	});

	nav.append(list);
	const header = document.getElementById("app-header")
		|| document.querySelector(".library-header, .viewer-header, .topbar");
	if (header) header.after(nav);
	else document.body.prepend(nav);
}
