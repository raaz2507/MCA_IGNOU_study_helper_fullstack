import type { PrismaClient } from "@prisma/client";
import type { CatalogRepository } from "../catalog.repository.port.js";

export class PrismaCatalogRepository implements CatalogRepository {
	constructor(private readonly client: PrismaClient) {}

	async subjects() {
		return this.client.subject.findMany({
			orderBy: [{ semester: "asc" }, { code: "asc" }],
			include: {
				studyMaterials: {
					orderBy: [{ groupName: "asc" }, { title: "asc" }],
					select: { groupName: true, title: true, filePath: true }
				},
				_count: { select: { papers: true } }
			}
		});
	}

	async papers(subjectCode?: string) {
		return this.client.paper.findMany({
			where: subjectCode ? { subject: { code: subjectCode } } : undefined,
			include: { subject: { select: { code: true } } },
			orderBy: [{ session: "desc" }, { title: "asc" }]
		});
	}
}
