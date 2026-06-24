import { createHash } from "node:crypto";
import type { RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { authService } from "../auth/auth.service.js";

const visitSchema = z.object({
	visitorId: z.string().min(12).max(120),
	sessionId: z.string().min(12).max(120),
	pagePath: z.string().min(1).max(240),
	referrer: z.string().max(300).optional().default(""),
	deviceType: z.enum(["mobile", "desktop", "tablet"]).default("desktop"),
	browser: z.string().max(40).default("Other"),
	country: z.string().max(80).optional().nullable()
});

const hash = (value: string) => createHash("sha256").update(value).digest("hex");

function referrerSource(referrer: string) {
	if (!referrer) return "Direct";
	let host = "";
	try {
		host = new URL(referrer).hostname.toLowerCase();
	} catch {
		return "Other";
	}
	if (host.includes("google.")) return "Google";
	if (host.includes("whatsapp.") || host.includes("wa.me")) return "WhatsApp";
	if (host.includes("t.me") || host.includes("telegram.")) return "Telegram";
	if (host.includes("youtube.")) return "YouTube";
	return host.replace(/^www\./, "");
}

function sessionFromRequest(request: Parameters<RequestHandler>[0]) {
	const token = request.cookies?.gyanpath_access;
	if (!token) return null;
	try {
		return authService.verifyAccess(token);
	} catch {
		return null;
	}
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const trackVisit: RequestHandler = asyncHandler(async (request, response) => {
	const input = visitSchema.parse(request.body);
	const session = sessionFromRequest(request);
	const userId = typeof session?.sub === "string" ? session.sub : null;
	await prisma.analyticsVisit.create({
		data: {
			userId,
			visitorHash: hash(input.visitorId),
			sessionId: hash(input.sessionId),
			pagePath: input.pagePath,
			referrer: input.referrer ? referrerSource(input.referrer) : "Direct",
			referrerSource: referrerSource(input.referrer || ""),
			deviceType: input.deviceType,
			browser: input.browser,
			country: input.country || "Unknown",
			loggedIn: Boolean(userId)
		}
	});
	response.status(204).end();
});

export const getAnalyticsSummary: RequestHandler = asyncHandler(async (_request, response) => {
	const now = new Date();
	const today = startOfDay(now);
	const sevenDaysAgo = new Date(today);
	sevenDaysAgo.setDate(today.getDate() - 6);
	const onlineSince = new Date(now.getTime() - 5 * 60 * 1000);

	const visits = await prisma.analyticsVisit.findMany({
		where: { createdAt: { gte: sevenDaysAgo } },
		orderBy: { createdAt: "asc" }
	});
	const listVisits = visits.length
		? visits
		: await prisma.analyticsVisit.findMany({
			orderBy: { createdAt: "desc" },
			take: 250
		});
	const totalVisits = await prisma.analyticsVisit.count();
	const uniqueVisitors = await prisma.analyticsVisit.groupBy({ by: ["visitorHash"] });
	const todayVisits = visits.filter((visit) => visit.createdAt >= today).length;
	const onlineNow = new Set(visits.filter((visit) => visit.createdAt >= onlineSince).map((visit) => visit.sessionId)).size;
	const userActivity = await prisma.analyticsVisit.groupBy({
		by: ["userId"],
		where: { userId: { not: null } },
		_count: { _all: true },
		_max: { createdAt: true },
		orderBy: { _max: { createdAt: "desc" } },
		take: 8
	});
	const activityUsers = await prisma.user.findMany({
		where: { id: { in: userActivity.map((item) => String(item.userId)) } },
		select: { id: true, username: true, displayName: true, role: true }
	});
	const usersById = new Map(activityUsers.map((user) => [user.id, user]));

	const countBy = (
		source: typeof visits,
		key: "pagePath" | "deviceType" | "browser" | "referrerSource" | "country"
	) =>
		Object.entries(source.reduce<Record<string, number>>((acc, visit) => {
			const value = String(visit[key] || "Unknown");
			acc[value] = (acc[value] || 0) + 1;
			return acc;
		}, {})).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);

	const last7Days = Array.from({ length: 7 }, (_, index) => {
		const day = new Date(sevenDaysAgo);
		day.setDate(sevenDaysAgo.getDate() + index);
		const next = new Date(day);
		next.setDate(day.getDate() + 1);
		return {
			date: day.toISOString().slice(0, 10),
			visits: visits.filter((visit) => visit.createdAt >= day && visit.createdAt < next).length
		};
	});

	response.json({
		totalVisits,
		todayVisits,
		uniqueVisitors: uniqueVisitors.length,
		onlineNow,
		topPages: countBy(listVisits, "pagePath").slice(0, 5),
		devices: countBy(listVisits, "deviceType"),
		browsers: countBy(listVisits, "browser"),
		referrers: countBy(listVisits, "referrerSource").slice(0, 5),
		countries: countBy(listVisits, "country").slice(0, 5),
		userActivity: userActivity.map((item) => {
			const user = usersById.get(String(item.userId));
			return {
				userId: item.userId,
				displayName: user?.displayName || "Deleted user",
				username: user?.username || "",
				role: user?.role || "",
				visits: item._count._all,
				lastActive: item._max.createdAt
			};
		}),
		loggedInVsGuest: [
			{ label: "Logged in", count: visits.filter((visit) => visit.loggedIn).length },
			{ label: "Guest", count: visits.filter((visit) => !visit.loggedIn).length }
		],
		last7Days
	});
});
