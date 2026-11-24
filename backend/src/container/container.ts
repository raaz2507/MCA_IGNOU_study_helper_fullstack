import type { CatalogRepository } from "../modules/catalog/catalog.repository.port.js";
import { DrizzleCatalogRepository } from "../modules/catalog/repositories/catalog.drizzle.repository.js";
import { appCore } from "./app-core.js";

class LazyDrizzleCatalogRepository implements CatalogRepository {
	private repo = new DrizzleCatalogRepository();
	async subjects() {
		return this.repo.subjects();
	}
	async papers(subjectCode?: string) {
		return this.repo.papers(subjectCode);
	}
}

export const container = Object.freeze({
	catalogRepository: new LazyDrizzleCatalogRepository(),
	core: appCore
});

export { appCore };
