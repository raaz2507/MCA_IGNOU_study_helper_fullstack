import { Router } from "express";
import { getCatalog, getPapers, getSubjects } from "./catalog.controller.js";

export const catalogRouter = Router();
catalogRouter.get("/catalog", getCatalog);
catalogRouter.get("/subjects", getSubjects);
catalogRouter.get("/papers", getPapers);

