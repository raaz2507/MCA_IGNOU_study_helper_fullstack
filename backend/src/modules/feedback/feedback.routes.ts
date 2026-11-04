import { Router } from "express";
import { feedbackController } from "./feedback.controller.js";
import { PrismaFeedbackRepository } from "./repositories/feedback.prisma.repository.js";

const repository = new PrismaFeedbackRepository();

export const feedbackRouter = Router();
feedbackRouter.post("/", feedbackController(repository));
