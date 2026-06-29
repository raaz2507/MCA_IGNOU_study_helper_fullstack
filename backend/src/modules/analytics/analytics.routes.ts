import { Router } from "express";
import { getAnalyticsSummary, trackVisit } from "./analytics.controller.js";
import { requireRoles } from "../auth/auth.middleware.js";
import { UserRole } from "../../domain/auth/roles.js";

export const analyticsRouter = Router();

analyticsRouter.post("/visit", trackVisit);
analyticsRouter.get("/summary", ...requireRoles(UserRole.ADMIN), getAnalyticsSummary);
