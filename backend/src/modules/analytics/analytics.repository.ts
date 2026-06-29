import { prisma } from "../../config/prisma.js";

export const analyticsRepository = {
	createVisit(data: {
		userId: string | null;
		visitorHash: string;
		sessionId: string;
		pagePath: string;
		referrer: string;
		referrerSource: string;
		deviceType: string;
		browser: string;
		country: string;
		loggedIn: boolean;
	}) {
		return prisma.analyticsVisit.create({ data });
	},
	visitsSince(createdAt: Date) {
		return prisma.analyticsVisit.findMany({
			where: { createdAt: { gte: createdAt } },
			orderBy: { createdAt: "asc" }
		});
	},
	recentVisits(take = 250) {
		return prisma.analyticsVisit.findMany({ orderBy: { createdAt: "desc" }, take });
	},
	totalVisits() {
		return prisma.analyticsVisit.count();
	},
	uniqueVisitors() {
		return prisma.analyticsVisit.groupBy({ by: ["visitorHash"] });
	},
	userActivity(take = 8) {
		return prisma.analyticsVisit.groupBy({
			by: ["userId"],
			where: { userId: { not: null } },
			_count: { _all: true },
			_max: { createdAt: true },
			orderBy: { _max: { createdAt: "desc" } },
			take
		});
	},
	usersByIds(ids: string[]) {
		return prisma.user.findMany({
			where: { id: { in: ids } },
			select: { id: true, username: true, displayName: true, role: true }
		});
	}
};
