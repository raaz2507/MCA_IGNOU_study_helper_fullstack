import {
	previewDatabaseRestore,
	restoreDatabaseBackup
} from "../api/admin.api.js";
import { showToast } from "../utils/toast.js";

const databaseBackupMessage = document.getElementById("databaseBackupMessage");
const databaseRestorePreview = document.getElementById("databaseRestorePreview");
let analyzedRestoreFile = null;

function setMessage(element, text, type = "") {
	if (!element) return;
	element.textContent = text;
	element.className = `admin-message ${type}`.trim();
	if (["success", "error", "warning", "info"].includes(type) && text) {
		showToast(text, type);
	}
}

function resetRestorePreview() {
	analyzedRestoreFile = null;
	if (databaseRestorePreview) {
		databaseRestorePreview.hidden = true;
		databaseRestorePreview.replaceChildren();
	}
	const confirmInput = document.getElementById("databaseRestoreConfirm");
	const restoreButton = document.getElementById("restoreDatabaseBackupButton");
	if (confirmInput) {
		confirmInput.checked = false;
		confirmInput.disabled = true;
	}
	if (restoreButton) restoreButton.disabled = true;
}

function renderRestorePreview(analysis) {
	if (!databaseRestorePreview) return;
	const totals = analysis.totals || {};
	const summary = [
		["Backup rows", totals.backup || 0],
		["Current rows", totals.current || 0],
		["New rows", totals.newRows || 0],
		["Existing matches", totals.existingRows || 0],
		["Backup duplicates", totals.duplicateRows || 0],
		["Possible conflicts", totals.conflictRows || 0],
		["Files in ZIP", analysis.files?.inArchive || 0],
		["Files already present", analysis.files?.alreadyPresent || 0]
	];
	const summaryCards = summary.map(([label, value]) => {
		const item = document.createElement("div");
		item.className = "admin-system-item";
		item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
		return item;
	});
	const table = document.createElement("table");
	table.className = "admin-table";
	table.innerHTML = `
		<thead>
			<tr>
				<th>Table</th>
				<th>Backup</th>
				<th>Current</th>
				<th>New</th>
				<th>Existing</th>
				<th>Duplicates</th>
				<th>Conflicts</th>
			</tr>
		</thead>
		<tbody></tbody>`;
	const body = table.querySelector("tbody");
	analysis.models.forEach((model) => {
		const row = document.createElement("tr");
		row.innerHTML = `
			<td><strong>${model.model}</strong></td>
			<td>${model.backup}</td>
			<td>${model.current}</td>
			<td>${model.newRows}</td>
			<td>${model.existingRows}</td>
			<td>${model.duplicateRows}</td>
			<td>${model.conflictRows}</td>`;
		body.append(row);
	});
	databaseRestorePreview.replaceChildren(...summaryCards, table);
	databaseRestorePreview.hidden = false;
}

document.getElementById("downloadDatabaseBackup")?.addEventListener("click", async () => {
	const button = document.getElementById("downloadDatabaseBackup");
	button.disabled = true;
	try {
		const response = await fetch("/api/admin/database/backup", { credentials: "include" });
		if (!response.ok) {
			const payload = await response.json().catch(() => ({}));
			throw new Error(payload.message || `Backup failed with status ${response.status}`);
		}
		const blob = await response.blob();
		const fallbackName = `gyanpath-database-backup-${new Date().toISOString().slice(0, 10)}.zip`;
		const disposition = response.headers.get("Content-Disposition") || "";
		const fileName = disposition.match(/filename="([^"]+)"/)?.[1] || fallbackName;
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = fileName;
		document.body.append(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
		setMessage(databaseBackupMessage, "Database and uploaded image backup downloaded.", "success");
	} catch (error) {
		setMessage(databaseBackupMessage, error.message, "error");
	} finally {
		button.disabled = false;
	}
});

document.getElementById("databaseRestoreFile")?.addEventListener("change", resetRestorePreview);
document.getElementById("databaseRestoreConfirm")?.addEventListener("change", (event) => {
	const restoreButton = document.getElementById("restoreDatabaseBackupButton");
	if (restoreButton) restoreButton.disabled = !event.target.checked || !analyzedRestoreFile;
});
document.getElementById("analyzeDatabaseBackup")?.addEventListener("click", async () => {
	const fileInput = document.getElementById("databaseRestoreFile");
	const button = document.getElementById("analyzeDatabaseBackup");
	const confirmInput = document.getElementById("databaseRestoreConfirm");
	const file = fileInput.files?.[0];
	if (!file) {
		setMessage(databaseBackupMessage, "Choose a backup file first.", "error");
		return;
	}
	button.disabled = true;
	try {
		const analysis = await previewDatabaseRestore(file);
		renderRestorePreview(analysis);
		analyzedRestoreFile = file;
		confirmInput.disabled = false;
		confirmInput.checked = false;
		document.getElementById("restoreDatabaseBackupButton").disabled = true;
		setMessage(databaseBackupMessage, "Backup analyzed. Review the summary before restoring.", "success");
	} catch (error) {
		resetRestorePreview();
		setMessage(databaseBackupMessage, error.message, "error");
	} finally {
		button.disabled = false;
	}
});
document.getElementById("databaseRestoreForm")?.addEventListener("submit", async (event) => {
	event.preventDefault();
	const fileInput = document.getElementById("databaseRestoreFile");
	const confirmInput = document.getElementById("databaseRestoreConfirm");
	const file = fileInput.files?.[0];
	if (!file || !confirmInput.checked) return;
	if (file !== analyzedRestoreFile) {
		setMessage(databaseBackupMessage, "Analyze this backup file before restoring it.", "error");
		return;
	}
	try {
		await restoreDatabaseBackup(file);
		fileInput.value = "";
		resetRestorePreview();
		setMessage(databaseBackupMessage, "Database and uploaded files restored from backup. Reloading page...", "success");
		window.setTimeout(() => window.location.reload(), 1200);
	} catch (error) {
		setMessage(databaseBackupMessage, error.message, "error");
	}
});
