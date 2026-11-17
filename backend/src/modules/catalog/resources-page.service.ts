import { programCatalogService } from "./program-catalog.service.js";

export async function resourcesPageData(programCodeOrId?: string) {
	return programCatalogService.getResourcesPageData(programCodeOrId);
}
