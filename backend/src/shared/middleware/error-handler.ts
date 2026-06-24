import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
	if (error instanceof ZodError) {
		response.status(400).json({
			code: "VALIDATION_ERROR",
			message: "Invalid request data.",
			issues: error.issues
		});
		return;
	}
	if (error instanceof AppError) {
		response.status(error.status).json({ code: error.code, message: error.message });
		return;
	}
	console.error(error);
	response.status(500).json({
		code: "INTERNAL_SERVER_ERROR",
		message: "Something went wrong."
	});
};

