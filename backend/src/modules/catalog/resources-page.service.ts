import { catalogDatabaseService } from "./catalog.database.service.js";
import { resourceCollections } from "./catalog.service.js";

export async function resourcesPageData() {
	const [semesters, papers] = await Promise.all([
		catalogDatabaseService.subjects(),
		catalogDatabaseService.papers()
	]);
	const paperSessionsBySubject: Record<string, string[]> = {};

	for (const paper of papers) {
		const sessions = paperSessionsBySubject[paper.subject] || [];
		if (paper.session && !sessions.includes(paper.session)) sessions.push(paper.session);
		paperSessionsBySubject[paper.subject] = sessions;
	}

	return {
		semesters,
		paperSessionsBySubject,
		collections: resourceCollections()
	};
}
