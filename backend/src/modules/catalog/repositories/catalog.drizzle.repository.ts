import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../../../config/db.js";
import { subjects, studyMaterials, papers } from "../../../infrastructure/database/schema.js";
import type { CatalogRepository } from "../catalog.repository.port.js";
import type { CatalogPaper, CatalogSubject } from "../catalog.models.js";

export class DrizzleCatalogRepository implements CatalogRepository {
	async subjects(): Promise<CatalogSubject[]> {
		const allSubjects = await db.select().from(subjects).orderBy(asc(subjects.semester), asc(subjects.code));
		const allMaterials = await db.select({
			subjectId: studyMaterials.subjectId,
			groupName: studyMaterials.groupName,
			title: studyMaterials.title,
			filePath: studyMaterials.filePath
		}).from(studyMaterials).orderBy(asc(studyMaterials.groupName), asc(studyMaterials.title));

		const paperCounts = await db.select({
			subjectId: papers.subjectId,
			count: sql<number>`count(*)`
		}).from(papers).groupBy(papers.subjectId);

		const materialsBySubject = new Map<string, Array<{ groupName: string; title: string; filePath: string }>>();
		for (const m of allMaterials) {
			const list = materialsBySubject.get(m.subjectId) || [];
			list.push({ groupName: m.groupName, title: m.title, filePath: m.filePath });
			materialsBySubject.set(m.subjectId, list);
		}

		const countsBySubject = new Map<string, number>();
		for (const p of paperCounts) {
			countsBySubject.set(p.subjectId, Number(p.count));
		}

		return allSubjects.map((s) => ({
			id: s.id,
			code: s.code,
			title: s.title,
			semester: s.semester,
			type: s.type,
			folderPath: s.folderPath,
			htmlViewerPath: s.htmlViewerPath,
			questionBank: Boolean(s.questionBank),
			studyMaterials: materialsBySubject.get(s.id) || [],
			_count: { papers: countsBySubject.get(s.id) || 0 }
		}));
	}

	async papers(subjectCode?: string): Promise<CatalogPaper[]> {
		const query = db.select({
			id: papers.id,
			title: papers.title,
			session: papers.session,
			englishPath: papers.englishPath,
			hindiPath: papers.hindiPath,
			previewPath: papers.previewPath,
			fileName: papers.fileName,
			pageCount: papers.pageCount,
			fileSize: papers.fileSize,
			updatedAt: papers.updatedAt,
			subjectCode: subjects.code
		})
		.from(papers)
		.innerJoin(subjects, eq(papers.subjectId, subjects.id))
		.orderBy(desc(papers.session), asc(papers.title));

		const rows = subjectCode
			? await query.where(eq(subjects.code, subjectCode))
			: await query;

		return rows.map((r) => ({
			id: r.id,
			title: r.title,
			session: r.session,
			englishPath: r.englishPath,
			hindiPath: r.hindiPath,
			previewPath: r.previewPath,
			fileName: r.fileName,
			pageCount: r.pageCount,
			fileSize: r.fileSize,
			updatedAt: new Date(r.updatedAt),
			subject: { code: r.subjectCode }
		}));
	}
}
