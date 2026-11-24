import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { appCore } from "../../container/app-core.js";

export const readLectureCatalog: RequestHandler = asyncHandler(async (_request, response) => {
	response.json(await appCore.lectures.read());
});

export const validateLectureCatalog: RequestHandler = asyncHandler(async (request, response) => {
	response.json(await appCore.lectures.validate(String(request.body.content || "")));
});

export const saveLectureCatalog: RequestHandler = asyncHandler(async (request, response) => {
	response.json(await appCore.lectures.save(String(request.body.content || "")));
});

export const syncLectureCatalog: RequestHandler = asyncHandler(async (request, response) => {
	response.json(await appCore.lectures.sync(request.body.updateExisting !== false));
});

export const listContent: RequestHandler = asyncHandler(async (request, response) => {
	response.json(await appCore.content.list(String(request.params.name)));
});

export const saveContent: RequestHandler = asyncHandler(async (request, response) => {
	response.json(await appCore.content.save(String(request.params.name), request.body));
});

export const fetchLectureMetadata: RequestHandler = asyncHandler(async (request, response) => {
	response.json(await appCore.content.fetchLectureMetadata(String(request.body.url || "")));
});

export const deleteContent: RequestHandler = asyncHandler(async (request, response) => {
	await appCore.content.remove(String(request.params.name), String(request.params.id));
	response.json({ success: true });
});

