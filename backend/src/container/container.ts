import type { CatalogRepository } from "../modules/catalog/catalog.repository.port.js";
import { DrizzleCatalogRepository } from "../modules/catalog/repositories/catalog.drizzle.repository.js";

class LazyDrizzleCatalogRepository implements CatalogRepository {
	private repo = new DrizzleCatalogRepository();
	async subjects() {
		return this.repo.subjects();
	}
	async papers(subjectCode?: string) {
		return this.repo.papers(subjectCode);
	}
}

export const container = Object.freeze({ catalogRepository: new LazyDrizzleCatalogRepository() });
