import { randomUUID } from "node:crypto";
import { asc, desc, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { analyticsVisits, users } from "../../infrastructure/database/schema.js";

export const analyticsRepository = {
	async createVisit(data: {
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
		const id = randomUUID();
		const now = new Date().toISOString();
		await db.insert(analyticsVisits).values({
			id,
			...data,
			createdAt: now
		});
		const rows = await db.select().from(analyticsVisits).where(eq(analyticsVisits.id, id));
		return rows[0];
	},

	async visitsSince(createdAt: Date) {
		const rows = await db.select()
			.from(analyticsVisits)
			.where(gte(analyticsVisits.createdAt, createdAt.toISOString()))
			.orderBy(asc(analyticsVisits.createdAt));
		return rows.map((r) => ({ ...r, createdAt: new Date(r.createdAt) }));
	},

	async recentVisits(take = 250) {
		const rows = await db.select()
			.from(analyticsVisits)
			.orderBy(desc(analyticsVisits.createdAt))
			.limit(take);
		return rows.map((r) => ({ ...r, createdAt: new Date(r.createdAt) }));
	},

	async totalVisits() {
		const res = await db.select({ count: sql<number>`count(*)` }).from(analyticsVisits);
		return Number(res[0]?.count || 0);
	},

	async uniqueVisitors() {
		return db.select({ visitorHash: analyticsVisits.visitorHash })
			.from(analyticsVisits)
			.groupBy(analyticsVisits.visitorHash);
	},

	async userActivity(take = 8) {
		return db.select({
			userId: analyticsVisits.userId,
			_count: { _all: sql<number>`count(*)` },
			_max: { createdAt: sql<string>`max(${analyticsVisits.createdAt})` }
		})
		.from(analyticsVisits)
		.where(isNotNull(analyticsVisits.userId))
		.groupBy(analyticsVisits.userId)
		.orderBy(desc(sql`max(${analyticsVisits.createdAt})`))
		.limit(take);
	},

	usersByIds(ids: string[]) {
		if (ids.length === 0) return Promise.resolve([]);
		return db.select({
			id: users.id,
			username: users.username,
			displayName: users.displayName,
			role: users.role
		})
		.from(users)
		.where(inArray(users.id, ids));
	}
};
