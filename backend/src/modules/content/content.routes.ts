import { Router } from "express";
import { UserRole } from "../../domain/auth/roles.js";
import { deleteContent, fetchLectureMetadata, listContent, saveContent } from "./content.controller.js";
import { requireRoles } from "../auth/auth.middleware.js";

export const contentRouter = Router();
contentRouter.post("/lectures/metadata", ...requireRoles(UserRole.ADMIN, UserRole.EDITOR), fetchLectureMetadata);
contentRouter.get("/:name", listContent);
contentRouter.post("/:name", ...requireRoles(UserRole.ADMIN, UserRole.EDITOR), saveContent);
contentRouter.put("/:name", ...requireRoles(UserRole.ADMIN, UserRole.EDITOR), saveContent);
contentRouter.delete("/:name/:id", ...requireRoles(UserRole.ADMIN), deleteContent);

