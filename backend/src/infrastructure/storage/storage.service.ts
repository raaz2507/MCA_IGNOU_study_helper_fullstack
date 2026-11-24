import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { env } from "../../config/env.js";

export class StorageService {
	readonly storageRoot: string;
	readonly resourcesRoot: string;
	readonly uploadsRoot: string;
	readonly originalImagesRoot: string;
	readonly databasePath: string;

	constructor() {
		this.storageRoot = env.storageRoot;
		this.resourcesRoot = env.localResourcesRoot;
		this.uploadsRoot = env.uploadsRoot;
		this.originalImagesRoot = path.join(this.storageRoot, "original_images");
		this.databasePath = env.databasePath;
	}

	/**
	 * Returns absolute path inside storage/resources.
	 */
	resourcePath(...parts: string[]): string {
		return path.join(this.resourcesRoot, ...parts);
	}

	/**
	 * Returns absolute path inside storage/uploads.
	 */
	uploadPath(...parts: string[]): string {
		return path.join(this.uploadsRoot, ...parts);
	}

	/**
	 * Converts a path relative to resourcesRoot into a clean public URL: /storage/resources/...
	 */
	resourcePublicUrl(relativeFilePath: string): string {
		const clean = relativeFilePath.split(path.sep).join("/").replace(/^\/+/, "");
		return `/storage/resources/${clean}`;
	}

	/**
	 * Converts category parts and fileName into public URL: /storage/uploads/...
	 */
	uploadPublicUrl(categoryParts: string[], fileName: string): string {
		return `/storage/uploads/${[...categoryParts, fileName].join("/")}`;
	}

	/**
	 * Validates and converts a public URL (/storage/uploads/...) into a safe absolute disk path.
	 * Protects against directory traversal.
	 */
	uploadPublicPathToAbsolute(publicPath: string): string | null {
		const prefix = "/storage/uploads/";
		if (!publicPath || !publicPath.startsWith(prefix)) return null;
		const relative = publicPath.slice(prefix.length).split("/").join(path.sep);
		const absolute = path.resolve(this.uploadsRoot, relative);
		if (!absolute.startsWith(path.resolve(this.uploadsRoot) + path.sep)) return null;
		return absolute;
	}

	/**
	 * Safely saves an uploaded file and returns its clean public URL.
	 */
	async saveUpload(categoryParts: string[], fileName: string, buffer: Buffer): Promise<string> {
		const targetDir = path.join(this.uploadsRoot, ...categoryParts);
		await fs.mkdir(targetDir, { recursive: true });
		const targetPath = path.join(targetDir, fileName);
		await fs.writeFile(targetPath, buffer);
		return this.uploadPublicUrl(categoryParts, fileName);
	}

	/**
	 * Safely deletes an uploaded file using its public URL.
	 */
	async deleteUpload(publicPath: string): Promise<boolean> {
		const absolute = this.uploadPublicPathToAbsolute(publicPath);
		if (!absolute) return false;
		try {
			await fs.unlink(absolute);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Checks if a resource file exists on disk.
	 */
	resourceExists(...parts: string[]): boolean {
		return existsSync(this.resourcePath(...parts));
	}
}

export const storageService = new StorageService();
