import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { appCore } from "../../container/app-core.js";

export const getPrograms: RequestHandler = asyncHandler(async (_request, response) => {
	response.json(await appCore.catalog.getPrograms());
});

export const getSubjects: RequestHandler = asyncHandler(async (request, response) => {
	const program = typeof request.query.program === "string" ? request.query.program : undefined;
	response.json(await appCore.catalog.getSemesters(program));
});

export const getCatalog: RequestHandler = asyncHandler(async (request, response) => {
	const program = typeof request.query.program === "string" ? request.query.program : undefined;
	const current = await appCore.catalog.getProgram(program);
	response.json({
		program: current,
		contentRoot: current.folderName,
		semesters: await appCore.catalog.getSemesters(current.code)
	});
});

export const getPapers: RequestHandler = asyncHandler(async (request, response) => {
	const subject = typeof request.query.subject === "string" ? request.query.subject : undefined;
	response.json(await appCore.catalog.getPapers(subject));
});

export const getResourceCollections: RequestHandler = asyncHandler(async (request, response) => {
	const program = typeof request.query.program === "string" ? request.query.program : undefined;
	const current = await appCore.catalog.getProgram(program);
	response.json(await appCore.catalog.getResourceCollections(current.folderName));
});
