import { prisma } from "../../config/prisma.js";

export const catalogRepository = {
	subjects() {
		return prisma.subject.findMany({
			orderBy: [{ semester: "asc" }, { code: "asc" }],
			include: {
				studyMaterials: { orderBy: [{ groupName: "asc" }, { title: "asc" }] },
				_count: { select: { papers: true } }
			}
		});
	},
	papers(subjectCode?: string) {
		return prisma.paper.findMany({
			where: subjectCode ? { subject: { code: subjectCode } } : undefined,
			include: { subject: { select: { code: true } } },
			orderBy: [{ session: "desc" }, { title: "asc" }]
		});
	}
};

