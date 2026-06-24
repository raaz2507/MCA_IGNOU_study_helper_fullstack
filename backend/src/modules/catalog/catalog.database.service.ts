import { env } from "../../config/env.js";
import { catalogRepository } from "./catalog.repository.js";

function pdfPath(filePath: string | null) {
	if (!filePath) return "";
	const normalized = filePath.split("\\").join("/");
	const marker = "/assets/resources/MCA_new/";
	const markerIndex = normalized.indexOf(marker);
	if (markerIndex >= 0) {
		return `${env.pdfResourceBaseUrl}/${normalized.slice(markerIndex + marker.length)}`;
	}
	if (normalized.startsWith("MCA_new/")) {
		return `${env.pdfResourceBaseUrl}/${normalized.slice("MCA_new/".length)}`;
	}
	return normalized;
}

export const catalogDatabaseService = {
	async subjects() {
		const subjects = await catalogRepository.subjects();
		const semesters = new Map<number, any[]>();

		for (const subject of subjects) {
			const groups = new Map<string, any[]>();
			for (const material of subject.studyMaterials) {
				const items = groups.get(material.groupName) || [];
				items.push({ title: material.title, path: pdfPath(material.filePath) });
				groups.set(material.groupName, items);
			}
			const item = {
				code: subject.code,
				name: subject.title,
				type: subject.type,
				semester: subject.semester,
				folderPath: subject.folderPath,
				questionPaperCount: subject._count.papers,
				galleryPage: subject._count.papers
					? `/paper-gallery?subject=${encodeURIComponent(subject.code)}`
					: "",
				htmlViewer: subject.htmlViewerPath || "",
				questionBank: subject.questionBank
					? `/question-bank?subject=${encodeURIComponent(subject.folderPath)}`
					: "",
				studyGroups: [...groups].map(([title, files]) => ({ title, files }))
			};
			const semester = semesters.get(subject.semester) || [];
			semester.push(item);
			semesters.set(subject.semester, semester);
		}

		return [...semesters]
			.sort(([a], [b]) => a - b)
			.map(([number, semesterSubjects]) => ({
				number,
				folder: `Semester_${number}`,
				subjects: semesterSubjects
			}));
	},
	async papers(subjectCode?: string) {
		return (await catalogRepository.papers(subjectCode)).map((paper) => ({
			id: paper.id,
			title: paper.title,
			subject: paper.subject.code,
			session: paper.session,
			english: pdfPath(paper.englishPath),
			hindi: pdfPath(paper.hindiPath),
			preview: paper.previewPath || "/assets/images/bckgruound.svg",
			fileName: paper.fileName,
			pages: paper.pageCount,
			size: paper.fileSize,
			updated: new Intl.DateTimeFormat("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric"
			}).format(paper.updatedAt)
		}));
	}
};
