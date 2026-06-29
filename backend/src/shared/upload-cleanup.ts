import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { uploadCleanupRepository } from "./upload-cleanup.repository.js";

function containsPath(value: unknown, publicPath: string): boolean {
	if (value === publicPath) return true;
	if (Array.isArray(value)) return value.some((item) => containsPath(item, publicPath));
	if (value && typeof value === "object") {
		return Object.values(value).some((item) => containsPath(item, publicPath));
	}
	return false;
}

function uploadAbsolutePath(publicPath: string) {
	if (!publicPath.startsWith("/uploads/")) return null;
	const uploadsRoot = path.resolve(env.projectRoot, "uploads");
	const relativePath = publicPath.slice("/uploads/".length).replaceAll("/", path.sep);
	const absolutePath = path.resolve(uploadsRoot, relativePath);
	if (!absolutePath.startsWith(uploadsRoot + path.sep)) return null;
	return { absolutePath, uploadsRoot };
}

async function isReferenced(publicPath: string) {
	const { bannerCount, contributorCount, settingValues } = await uploadCleanupRepository.references(publicPath);
	return bannerCount > 0
		|| contributorCount > 0
		|| settingValues.some((value) => containsPath(value, publicPath));
}

async function removeEmptyParentDirectories(startDirectory: string, uploadsRoot: string) {
	let current = startDirectory;
	while (current.startsWith(uploadsRoot + path.sep)) {
		try {
			if ((await fs.readdir(current)).length) return;
			await fs.rmdir(current);
		} catch {
			return;
		}
		current = path.dirname(current);
	}
}

export async function deleteUnreferencedUpload(publicPath: string | null | undefined) {
	if (!publicPath) return false;
	const resolved = uploadAbsolutePath(publicPath);
	if (!resolved || await isReferenced(publicPath)) return false;
	await fs.rm(resolved.absolutePath, { force: true });
	await uploadCleanupRepository.deleteFileAssetByPath(publicPath);
	await removeEmptyParentDirectories(path.dirname(resolved.absolutePath), resolved.uploadsRoot);
	return true;
}

export async function cleanupReplacedUpload(
	previousPath: string | null | undefined,
	nextPath: string | null | undefined
) {
	if (!previousPath || previousPath === nextPath) return false;
	return deleteUnreferencedUpload(previousPath);
}
