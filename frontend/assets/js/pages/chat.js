const search = document.getElementById("chatSearch");
const conversations = [...document.querySelectorAll(".conversation")];
const filters = [...document.querySelectorAll("[data-chat-filter]")];
const empty = document.getElementById("chatEmpty");
const toast = document.getElementById("chatToast");
const activeName = document.getElementById("activeChatName");
let activeFilter = "all";

function render() {
	const query = search?.value.trim().toLowerCase() || "";
	let count = 0;
	conversations.forEach((conversation) => {
		const kind = conversation.dataset.kind;
		const matchesFilter = activeFilter === "all" || kind === activeFilter;
		const matchesSearch = conversation.dataset.name.toLowerCase().includes(query);
		conversation.hidden = !(matchesFilter && matchesSearch);
		if (!conversation.hidden) count += 1;
	});
	if (empty) empty.hidden = count !== 0;
}

filters.forEach((button) => button.addEventListener("click", () => {
	activeFilter = button.dataset.chatFilter;
	filters.forEach((item) => item.classList.toggle("active", item === button));
	render();
}));
search?.addEventListener("input", render);
conversations.forEach((conversation) => conversation.addEventListener("click", () => {
	conversations.forEach((item) => item.classList.toggle("active", item === conversation));
	if (activeName) activeName.textContent = conversation.dataset.name;
}));

function showToast(message) {
	if (!toast) return;
	toast.textContent = `${message} is disabled in this static preview.`;
	toast.classList.add("visible");
	window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

document.querySelectorAll("[data-chat-action]").forEach((button) => button.addEventListener("click", () => showToast(button.dataset.chatAction)));
document.getElementById("chatComposer")?.addEventListener("submit", (event) => {
	event.preventDefault();
	showToast("Message sending");
});
