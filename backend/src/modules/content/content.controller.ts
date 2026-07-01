import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { contentService } from "./content.service.js";
import { lectureCatalogService } from "./lecture-catalog.service.js";

export const readLectureCatalog: RequestHandler = asyncHandler(async (_request, response) => {
	response.json(await lectureCatalogService.read());
});

export const validateLectureCatalog: RequestHandler = asyncHandler(async (request, response) => {
	response.json(await lectureCatalogService.validate(String(request.body.content || "")));
});

export const saveLectureCatalog: RequestHandler = asyncHandler(async (request, response) => {
	response.json(await lectureCatalogService.save(String(request.body.content || "")));
});

export const syncLectureCatalog: RequestHandler = asyncHandler(async (request, response) => {
	response.json(await lectureCatalogService.sync(request.body.updateExisting !== false));
});

export const listContent: RequestHandler = asyncHandler(async (request, response) => {
	response.json(await contentService.list(String(request.params.name)));
});

export const saveContent: RequestHandler = asyncHandler(async (request, response) => {
	response.json(await contentService.save(String(request.params.name), request.body));
});

export const fetchLectureMetadata: RequestHandler = asyncHandler(async (request, response) => {
	response.json(await contentService.fetchLectureMetadata(String(request.body.url || "")));
});

export const deleteContent: RequestHandler = asyncHandler(async (request, response) => {
	await contentService.remove(String(request.params.name), String(request.params.id));
	response.json({ success: true });
});

