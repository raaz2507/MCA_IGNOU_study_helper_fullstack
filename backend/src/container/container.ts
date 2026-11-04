import type { CatalogRepository } from "../modules/catalog/catalog.repository.port.js";
import { PrismaCatalogRepository } from "../modules/catalog/repositories/catalog.prisma.repository.js";

class LazyPrismaCatalogRepository implements CatalogRepository {
	async subjects() {
		const { prisma } = await import("../config/prisma.js");
		return new PrismaCatalogRepository(prisma).subjects();
	}
	async papers(subjectCode?: string) {
		const { prisma } = await import("../config/prisma.js");
		return new PrismaCatalogRepository(prisma).papers(subjectCode);
	}
}

export const container = Object.freeze({ catalogRepository: new LazyPrismaCatalogRepository() });
