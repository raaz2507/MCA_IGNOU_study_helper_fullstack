import { Router } from "express";
import { feedbackController } from "./feedback.controller.js";
import { DrizzleFeedbackRepository } from "./repositories/feedback.drizzle.repository.js";

const repository = new DrizzleFeedbackRepository();

export const feedbackRouter = Router();
feedbackRouter.post("/", feedbackController(repository));
