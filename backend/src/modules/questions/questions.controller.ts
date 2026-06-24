import type { RequestHandler } from "express";
import { z } from "zod";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { questionsService } from "./questions.service.js";

const subjectQuery = z.object({ subject: z.string().min(1) });
const itemQuery = subjectQuery.extend({ file: z.string().min(1) });

export const getManifest: RequestHandler = asyncHandler(async (request, response) => {
	const query = subjectQuery.parse(request.query);
	response.json(await questionsService.manifest(query.subject));
});

export const getQuestion: RequestHandler = asyncHandler(async (request, response) => {
	const query = itemQuery.parse(request.query);
	response.json(await questionsService.question(query.subject, query.file));
});

