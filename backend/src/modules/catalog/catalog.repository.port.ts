import type { CatalogPaper, CatalogSubject } from "./catalog.models.js";

/** Storage-independent operations required by the catalog application service. */
export interface CatalogRepository {
	subjects(): Promise<CatalogSubject[]>;
	papers(subjectCode?: string): Promise<CatalogPaper[]>;
}
