import { Router } from "express";
import { getAnalyticsSummary, trackVisit } from "./analytics.controller.js";
import { requireRoles } from "../auth/auth.middleware.js";
import { UserRole } from "@prisma/client";

export const analyticsRouter = Router();

analyticsRouter.post("/visit", trackVisit);
analyticsRouter.get("/summary", ...requireRoles(UserRole.ADMIN), getAnalyticsSummary);
