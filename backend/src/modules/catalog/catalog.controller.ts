import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { catalogDatabaseService } from "./catalog.database.service.js";
import { resourceCollections } from "./catalog.service.js";

export const getSubjects: RequestHandler = asyncHandler(async (_request, response) => {
	response.json(await catalogDatabaseService.subjects());
});

export const getCatalog: RequestHandler = asyncHandler(async (_request, response) => {
	response.json({
		contentRoot: "MCA_new",
		semesters: await catalogDatabaseService.subjects()
	});
});

export const getPapers: RequestHandler = asyncHandler(async (request, response) => {
	response.json(await catalogDatabaseService.papers(String(request.query.subject || "") || undefined));
});

export const getResourceCollections: RequestHandler = asyncHandler(async (_request, response) => {
	response.json(resourceCollections());
});
