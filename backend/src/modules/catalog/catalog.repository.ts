import { DrizzleCatalogRepository } from "./repositories/catalog.drizzle.repository.js";

const repo = new DrizzleCatalogRepository();

export const catalogRepository = {
	subjects() {
		return repo.subjects();
	},
	papers(subjectCode?: string) {
		return repo.papers(subjectCode);
	}
};
