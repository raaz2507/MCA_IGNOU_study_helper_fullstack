import { Router } from "express";
import { getCatalog, getPapers, getResourceCollections, getSubjects } from "./catalog.controller.js";

export const catalogRouter = Router();
catalogRouter.get("/catalog", getCatalog);
catalogRouter.get("/subjects", getSubjects);
catalogRouter.get("/papers", getPapers);
catalogRouter.get("/resource-collections", getResourceCollections);
