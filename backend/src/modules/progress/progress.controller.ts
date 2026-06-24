import type { RequestHandler } from "express";
import { z } from "zod";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { progressService } from "./progress.service.js";

const subjectSchema = z.string().min(1);
const stateSchema = z.object({
	done: z.array(z.string()).default([]),
	bookmarks: z.array(z.string()).default([]),
	revision: z.array(z.string()).default([])
});

export const getProgress: RequestHandler = asyncHandler(async (request, response) => {
	const subject = subjectSchema.parse(request.query.subject);
	response.json(await progressService.get(request.user!.id, subject));
});

export const saveProgress: RequestHandler = asyncHandler(async (request, response) => {
	const subject = subjectSchema.parse(request.query.subject);
	response.json(await progressService.save(request.user!.id, subject, stateSchema.parse(request.body)));
});

