import type { CatalogRepository } from "../catalog.repository.port.js";
import type { Firestore } from "firebase-admin/firestore";
import { firestoreCollections as collections } from "../../../infrastructure/database/firestore/collections.js";

/** Dependency-free boundary until Firebase Admin credentials and SDK are configured. */
export class FirestoreCatalogRepository implements CatalogRepository {
	constructor(private readonly db: Firestore) {}

	async subjects(): ReturnType<CatalogRepository["subjects"]> {
		const [subjectSnapshot, materialSnapshot, paperSnapshot] = await Promise.all([
			this.db.collection(collections.subjects).get(),
			this.db.collection(collections.studyMaterials).get(),
			this.db.collection(collections.papers).select("subjectId").get()
		]);
		const materials = materialSnapshot.docs.map((doc) => doc.data());
		const paperCounts = paperSnapshot.docs.reduce((counts, doc) => {
			const subjectId = String(doc.data().subjectId || "");
			counts.set(subjectId, (counts.get(subjectId) || 0) + 1);
			return counts;
		}, new Map<string, number>());
		return subjectSnapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				code: String(data.code),
				title: String(data.title),
				semester: Number(data.semester),
				type: String(data.type),
				folderPath: String(data.folderPath),
				htmlViewerPath: data.htmlViewerPath ? String(data.htmlViewerPath) : null,
				questionBank: Boolean(data.questionBank),
				studyMaterials: materials
					.filter((item) => item.subjectId === doc.id)
					.map((item) => ({ groupName: String(item.groupName), title: String(item.title), filePath: String(item.filePath) }))
					.sort((a, b) => a.groupName.localeCompare(b.groupName) || a.title.localeCompare(b.title)),
				_count: { papers: paperCounts.get(doc.id) || 0 }
			};
		}).sort((a, b) => a.semester - b.semester || a.code.localeCompare(b.code));
	}

	async papers(subjectCode?: string): ReturnType<CatalogRepository["papers"]> {
		const subjectSnapshot = subjectCode
			? await this.db.collection(collections.subjects).where("code", "==", subjectCode).limit(1).get()
			: await this.db.collection(collections.subjects).get();
		const subjects = new Map(subjectSnapshot.docs.map((doc) => [doc.id, String(doc.data().code)]));
		if (!subjects.size) return [];
		const paperSnapshot = await this.db.collection(collections.papers).get();
		return paperSnapshot.docs
			.filter((doc) => subjects.has(String(doc.data().subjectId)))
			.map((doc) => {
				const data = doc.data();
				const updatedAt = data.updatedAt?.toDate?.() || new Date(data.updatedAt);
				return {
					id: doc.id,
					title: String(data.title), session: String(data.session),
					englishPath: String(data.englishPath), hindiPath: data.hindiPath ? String(data.hindiPath) : null,
					previewPath: data.previewPath ? String(data.previewPath) : null,
					fileName: String(data.fileName), pageCount: data.pageCount == null ? null : Number(data.pageCount),
					fileSize: data.fileSize == null ? null : Number(data.fileSize), updatedAt,
					subject: { code: subjects.get(String(data.subjectId)) || "" }
				};
			})
			.sort((a, b) => b.session.localeCompare(a.session) || a.title.localeCompare(b.title));
	}
}
