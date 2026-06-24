export function openModal(dialog) {
	if (!dialog) return;
	if (typeof dialog.showModal === "function") dialog.showModal();
	else dialog.setAttribute("open", "");
}

export function closeModal(dialog) {
	if (!dialog) return;
	if (typeof dialog.close === "function") dialog.close();
	else dialog.removeAttribute("open");
}
