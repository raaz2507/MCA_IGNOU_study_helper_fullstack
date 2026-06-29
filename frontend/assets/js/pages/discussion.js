const search = document.getElementById("discussionSearch");
const items = [...document.querySelectorAll(".discussion-item")];
const filters = [...document.querySelectorAll("[data-filter]")];
const empty = document.getElementById("discussionEmpty");
const toast = document.getElementById("discussionToast");
let activeFilter = "all";

function render() {
	const query = search?.value.trim().toLowerCase() || "";
	let visible = 0;
	items.forEach((item) => {
		const matchesFilter = activeFilter === "all" || item.dataset.status === activeFilter;
		const matchesSearch = !query || item.dataset.search.includes(query);
		item.hidden = !(matchesFilter && matchesSearch);
		if (!item.hidden) visible += 1;
	});
	if (empty) empty.hidden = visible !== 0;
}

filters.forEach((button) => button.addEventListener("click", () => {
	activeFilter = button.dataset.filter;
	filters.forEach((item) => item.classList.toggle("active", item === button));
	render();
}));
search?.addEventListener("input", render);

document.querySelectorAll("[data-demo-action]").forEach((button) => button.addEventListener("click", () => {
	if (!toast) return;
	toast.textContent = `${button.dataset.demoAction} will be enabled when the discussion API is connected.`;
	toast.classList.add("visible");
	window.setTimeout(() => toast.classList.remove("visible"), 2600);
}));
