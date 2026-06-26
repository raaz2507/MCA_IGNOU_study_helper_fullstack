import {
	moveOldUploadImages,
	previewDatabaseRestore,
	restoreDatabaseBackup
} from "../api/admin.api.js";
import { showToast } from "../utils/toast.js";

const databaseBackupMessage = document.getElementById("databaseBackupMessage");
const databaseRestorePreview = document.getElementById("databaseRestorePreview");
const uploadStorageMessage = document.getElementById("uploadStorageMessage");
let analyzedRestoreFile = null;
let lastAnalysis = null;

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
	lastAnalysis = null;
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
	databaseRestorePreview.classList.add("database-restore-preview");
	const totals = analysis.totals || {};
	const summary = [
		["Backup rows", totals.backup || 0],
		["Current rows", totals.current || 0],
		["New rows", totals.newRows || 0],
		["Existing matches", totals.existingRows || 0],
		["Backup duplicates", totals.duplicateRows || 0],
		["Possible conflicts", totals.conflictRows || 0],
		["Files in ZIP", analysis.files?.inArchive || 0],
		["Same files", analysis.files?.same || 0],
		["Different files", analysis.files?.different || 0],
		["Missing files", analysis.files?.missingOnServer || 0]
	];
	const summaryCards = summary.map(([label, value]) => {
		const item = document.createElement("div");
		item.className = "admin-system-item database-restore-stat";
		item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
		return item;
	});
	const tableWrap = document.createElement("div");
	tableWrap.className = "database-restore-table-wrap";
	const table = document.createElement("table");
	table.className = "database-restore-table";
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
	tableWrap.append(table);
	const entryTableWrap = document.createElement("div");
	entryTableWrap.className = "database-restore-table-wrap database-entry-table-wrap";
	const entryTable = document.createElement("table");
	entryTable.className = "database-restore-table database-entry-table";
	entryTable.innerHTML = `
		<thead>
			<tr>
				<th>Entry</th>
				<th>Status</th>
				<th>Current</th>
				<th>Backup</th>
				<th>Action</th>
			</tr>
		</thead>
		<tbody></tbody>`;
	const entryBody = entryTable.querySelector("tbody");
	const entries = analysis.models.flatMap((model) =>
		(model.items || []).map((item) => ({ ...item, model: model.model }))
	);
	if (entries.length) {
		entries.forEach((entry) => {
			const row = document.createElement("tr");
			row.dataset.entryStatus = entry.status;
			row.innerHTML = `
				<td><strong>${entry.model}</strong><small>${entry.label}</small></td>
				<td><span class="database-file-status">${entry.status}</span></td>
				<td>${entry.currentPreview || "-"}</td>
				<td>${entry.backupPreview || "-"}</td>
				<td>${actionSelect("entry", `${entry.model}:${entry.key}`, entry.defaultAction)}</td>`;
			entryBody.append(row);
		});
	} else {
		const row = document.createElement("tr");
		row.innerHTML = '<td colspan="5"><strong>No existing or conflicting database entries found.</strong></td>';
		entryBody.append(row);
	}
	entryTableWrap.append(entryTable);
	const fileTableWrap = document.createElement("div");
	fileTableWrap.className = "database-restore-table-wrap database-file-table-wrap";
	const fileTable = document.createElement("table");
	fileTable.className = "database-restore-table database-file-table";
	fileTable.innerHTML = `
		<thead>
			<tr>
				<th>Image/File path</th>
				<th>Current image</th>
				<th>Backup image</th>
				<th>Backup size</th>
				<th>Current size</th>
				<th>Status</th>
				<th>Action</th>
			</tr>
		</thead>
		<tbody></tbody>`;
	const fileBody = fileTable.querySelector("tbody");
	const files = analysis.files?.items || [];
	if (files.length) {
		files.forEach((file) => {
			const row = document.createElement("tr");
			row.dataset.fileStatus = file.status;
			row.innerHTML = `
				<td><strong>${file.path}</strong></td>
				<td>${imagePreviewBox(file.currentPreviewUrl, "Current image")}</td>
				<td>${imagePreviewBox(file.archivePreviewUrl, "Backup image")}</td>
				<td>${formatBytes(file.archiveSize ?? file.size ?? 0)}</td>
				<td>${file.currentSize === null ? "-" : formatBytes(file.currentSize)}</td>
				<td><span class="database-file-status">${fileStatusLabel(file.status)}</span></td>
				<td>${actionSelect("file", file.path, file.defaultAction)}</td>`;
			fileBody.append(row);
		});
	} else {
		const row = document.createElement("tr");
		row.innerHTML = '<td colspan="7"><strong>No uploaded image files found in this backup.</strong></td>';
		fileBody.append(row);
	}
	fileTableWrap.append(fileTable);
	databaseRestorePreview.replaceChildren(...summaryCards, tableWrap, entryTableWrap, fileTableWrap);
	databaseRestorePreview.hidden = false;
}

function imagePreviewBox(src, label) {
	if (!src) return '<div class="database-image-preview is-empty">No image</div>';
	return `<a class="database-image-preview" href="${src}" target="_blank" rel="noopener noreferrer" aria-label="${label}"><img src="${src}" alt="${label}" loading="lazy" /></a>`;
}

function actionSelect(kind, key, value) {
	return `
		<select class="database-resolution-select" data-resolution-kind="${kind}" data-resolution-key="${key}">
			<option value="current"${value === "current" ? " selected" : ""}>Keep current</option>
			<option value="backup"${value === "backup" ? " selected" : ""}>Use backup</option>
			<option value="skip"${value === "skip" ? " selected" : ""}>Skip</option>
		</select>`;
}

function collectResolution() {
	const resolution = { mode: "merge", entries: {}, files: {} };
	document.querySelectorAll("[data-resolution-kind]").forEach((select) => {
		const target = select.dataset.resolutionKind === "file" ? resolution.files : resolution.entries;
		target[select.dataset.resolutionKey] = select.value;
	});
	return resolution;
}

function formatBytes(size = 0) {
	if (!size) return "0 B";
	const units = ["B", "KB", "MB"];
	let value = size;
	let unit = 0;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit += 1;
	}
	return `${value.toFixed(unit ? 1 : 0)} ${units[unit]}`;
}

function fileStatusLabel(status) {
	return ({
		same: "Same",
		different: "Different",
		missingOnServer: "Missing on server",
		missingInArchive: "Missing in ZIP"
	})[status] || status;
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

document.getElementById("moveOldUploadImages")?.addEventListener("click", async () => {
	const button = document.getElementById("moveOldUploadImages");
	button.disabled = true;
	try {
		const summary = await moveOldUploadImages();
		const text = `Moved ${summary.moved || 0} image(s). Mapping saved for ${Object.keys(summary.mappings || {}).length} path(s). Missing ${summary.missing || 0}. Database not updated in this step.`;
		setMessage(uploadStorageMessage, text, "success");
	} catch (error) {
		setMessage(uploadStorageMessage, error.message, "error");
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
		lastAnalysis = analysis;
		renderRestorePreview(analysis);
		analyzedRestoreFile = file;
		confirmInput.disabled = false;
		confirmInput.checked = false;
		document.getElementById("restoreDatabaseBackupButton").disabled = true;
		setMessage(databaseBackupMessage, "Backup analysed. Review the summary before restoring.", "success");
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
		setMessage(databaseBackupMessage, "Analyse this backup file before restoring it.", "error");
		return;
	}
	try {
		await restoreDatabaseBackup(file, collectResolution());
		fileInput.value = "";
		resetRestorePreview();
		setMessage(databaseBackupMessage, "Database and uploaded files restored from backup. Reloading page...", "success");
		window.setTimeout(() => window.location.reload(), 1200);
	} catch (error) {
		setMessage(databaseBackupMessage, error.message, "error");
	}
});
