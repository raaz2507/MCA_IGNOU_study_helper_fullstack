import { createHash } from "node:crypto";
import type { RequestHandler } from "express";
import { z } from "zod";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { authService } from "../auth/auth.service.js";
import type { FeedbackRepository } from "./feedback.repository.js";

const schema = z.object({
	mood: z.enum(["very-happy", "happy", "neutral", "confused", "sad"]),
	message: z.string().trim().max(400).default(""),
	pagePath: z.string().trim().min(1).max(200).default("/about"),
	visitorId: z.string().min(12).max(120).optional()
});

function userId(request: Parameters<RequestHandler>[0]) {
	const token = request.cookies?.gyanpath_access;
	if (!token) return null;
	try { return String(authService.verifyAccess(token).sub || "") || null; } catch { return null; }
}

export function feedbackController(repository: FeedbackRepository): RequestHandler {
	return asyncHandler(async (request, response) => {
		const input = schema.parse(request.body);
		const saved = await repository.create({
			userId: userId(request),
			visitorHash: input.visitorId ? createHash("sha256").update(input.visitorId).digest("hex") : null,
			mood: input.mood,
			message: input.message,
			pagePath: input.pagePath
		});
		response.status(201).json(saved);
	});
}
