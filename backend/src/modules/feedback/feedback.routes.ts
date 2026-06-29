import { Router } from "express";
import { databaseConfig } from "../../infrastructure/database/database.config.js";
import { firestoreClient } from "../../infrastructure/database/firestore/firestore.client.js";
import { feedbackController } from "./feedback.controller.js";
import { FirestoreFeedbackRepository } from "./repositories/feedback.firestore.repository.js";
import { PrismaFeedbackRepository } from "./repositories/feedback.prisma.repository.js";

const repository = databaseConfig.adapter === "firestore"
	? new FirestoreFeedbackRepository(firestoreClient())
	: new PrismaFeedbackRepository();

export const feedbackRouter = Router();
feedbackRouter.post("/", feedbackController(repository));
