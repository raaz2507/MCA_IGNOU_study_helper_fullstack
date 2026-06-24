import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { getProgress, saveProgress } from "./progress.controller.js";

export const progressRouter = Router();
progressRouter.use(requireAuth);
progressRouter.get("/", getProgress);
progressRouter.put("/", saveProgress);

