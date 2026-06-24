import { Router } from "express";
import { getManifest, getQuestion } from "./questions.controller.js";

export const questionsRouter = Router();
questionsRouter.get("/manifest", getManifest);
questionsRouter.get("/item", getQuestion);

