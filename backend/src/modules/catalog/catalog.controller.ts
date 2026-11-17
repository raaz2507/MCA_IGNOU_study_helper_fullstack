import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { programCatalogService } from "./program-catalog.service.js";

export const getPrograms: RequestHandler = asyncHandler(async (_request, response) => {
	response.json(await programCatalogService.getPrograms());
});

export const getSubjects: RequestHandler = asyncHandler(async (request, response) => {
	const program = typeof request.query.program === "string" ? request.query.program : undefined;
	response.json(await programCatalogService.getSemesters(program));
});

export const getCatalog: RequestHandler = asyncHandler(async (request, response) => {
	const program = typeof request.query.program === "string" ? request.query.program : undefined;
	const current = await programCatalogService.getProgram(program);
	response.json({
		program: current,
		contentRoot: current.folderName,
		semesters: await programCatalogService.getSemesters(current.code)
	});
});

export const getPapers: RequestHandler = asyncHandler(async (request, response) => {
	const subject = typeof request.query.subject === "string" ? request.query.subject : undefined;
	response.json(await programCatalogService.getPapers(subject));
});

export const getResourceCollections: RequestHandler = asyncHandler(async (request, response) => {
	const program = typeof request.query.program === "string" ? request.query.program : undefined;
	const current = await programCatalogService.getProgram(program);
	response.json(await programCatalogService.getResourceCollections(current.folderName));
});
