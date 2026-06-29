import { databaseConfig } from "../infrastructure/database/database.config.js";
import { firestoreClient } from "../infrastructure/database/firestore/firestore.client.js";
import type { CatalogRepository } from "../modules/catalog/catalog.repository.port.js";
import { PrismaCatalogRepository } from "../modules/catalog/repositories/catalog.prisma.repository.js";
import { FirestoreCatalogRepository } from "../modules/catalog/repositories/catalog.firestore.repository.js";

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

function createCatalogRepository(): CatalogRepository {
	if (databaseConfig.adapter === "firestore") {
		return new FirestoreCatalogRepository(firestoreClient());
	}
	return new LazyPrismaCatalogRepository();
}

export const container = Object.freeze({ catalogRepository: createCatalogRepository() });
