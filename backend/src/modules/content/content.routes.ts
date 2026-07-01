import { Router } from "express";
import { UserRole } from "../../domain/auth/roles.js";
import {
	deleteContent, fetchLectureMetadata, listContent, readLectureCatalog, saveContent,
	saveLectureCatalog, syncLectureCatalog, validateLectureCatalog
} from "./content.controller.js";
import { requireRoles } from "../auth/auth.middleware.js";

export const contentRouter = Router();
const lectureCatalogRoles = requireRoles(UserRole.ADMIN, UserRole.EDITOR);
contentRouter.get("/lectures/catalog", ...lectureCatalogRoles, readLectureCatalog);
contentRouter.post("/lectures/catalog/validate", ...lectureCatalogRoles, validateLectureCatalog);
contentRouter.put("/lectures/catalog", ...lectureCatalogRoles, saveLectureCatalog);
contentRouter.post("/lectures/catalog/sync", ...lectureCatalogRoles, syncLectureCatalog);
contentRouter.post("/lectures/metadata", ...requireRoles(UserRole.ADMIN, UserRole.EDITOR), fetchLectureMetadata);
contentRouter.get("/:name", listContent);
contentRouter.post("/:name", ...requireRoles(UserRole.ADMIN, UserRole.EDITOR), saveContent);
contentRouter.put("/:name", ...requireRoles(UserRole.ADMIN, UserRole.EDITOR), saveContent);
contentRouter.delete("/:name/:id", ...requireRoles(UserRole.ADMIN), deleteContent);

