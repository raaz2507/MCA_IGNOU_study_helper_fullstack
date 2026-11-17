import { eq, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import { banners, contributors, appSettings, fileAssets } from "../infrastructure/database/schema.js";

export const uploadCleanupRepository = {
	async references(publicPath: string) {
		const [bannerRes, contribRes, settings] = await Promise.all([
			db.select({ count: sql<number>`count(*)` }).from(banners).where(eq(banners.image, publicPath)),
			db.select({ count: sql<number>`count(*)` }).from(contributors).where(eq(contributors.avatar, publicPath)),
			db.select({ value: appSettings.value }).from(appSettings)
		]);
		const bannerCount = Number(bannerRes[0]?.count || 0);
		const contributorCount = Number(contribRes[0]?.count || 0);
		return { bannerCount, contributorCount, settingValues: settings.map((s) => s.value) };
	},
	deleteFileAssetByPath(publicPath: string) {
		return db.delete(fileAssets).where(eq(fileAssets.path, publicPath));
	}
};
