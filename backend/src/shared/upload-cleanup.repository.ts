import { prisma } from "../config/prisma.js";

export const uploadCleanupRepository = {
	async references(publicPath: string) {
		const [bannerCount, contributorCount, settings] = await Promise.all([
			prisma.banner.count({ where: { image: publicPath } }),
			prisma.contributor.count({ where: { avatar: publicPath } }),
			prisma.appSetting.findMany({ select: { value: true } })
		]);
		return { bannerCount, contributorCount, settingValues: settings.map((setting) => setting.value) };
	},
	deleteFileAssetByPath(publicPath: string) {
		return prisma.fileAsset.deleteMany({ where: { path: publicPath } });
	}
};
