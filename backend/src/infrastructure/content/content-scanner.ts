import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { configuredSubjects, contentSetup } from "../../config/content.setup.js";
import type { ContentFile, ContentKind, ContentLanguage, ContentManifest } from "./content.types.js";

const normalizedCode = (value: string) => value.replaceAll("_", "-").toUpperCase();
const displayTitle = (fileName: string) => path.parse(fileName).name
	.replace(/-hi$/i, "")
	.replace(/[_-]+/g, " ")
	.replace(/\s+/g, " ")
	.trim();

function pdfFiles(folder: string): string[] {
	if (!existsSync(folder)) return [];
	return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
		const item = path.join(folder, entry.name);
		if (entry.isDirectory()) return pdfFiles(item);
		return entry.isFile() && entry.name.toLowerCase().endsWith(".pdf") ? [item] : [];
	});
}

function digest(file: string) {
	return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function contentFile(root: string, file: string, kind: ContentKind, extra: Partial<ContentFile> = {}): ContentFile {
	const relative = path.relative(root, file).split(path.sep).join("/");
	const fileName = path.basename(file);
	const checksum = digest(file);
	return {
		id: createHash("sha1").update(`${kind}:${relative.toLowerCase()}`).digest("hex"),
		kind,
		language: /-hi\.pdf$/i.test(fileName) ? "hi" satisfies ContentLanguage : "en",
		path: relative,
		fileName,
		title: displayTitle(fileName),
		size: statSync(file).size,
		checksum,
		updatedAt: statSync(file).mtime.toISOString(),
		...extra
	};
}

export function scanContent(resourceRoot: string): ContentManifest {
	const warnings: string[] = [];
	const files: ContentFile[] = [];
	const folders = contentSetup.folders;

	for (const file of pdfFiles(path.join(resourceRoot, folders.programGuides))) {
		files.push(contentFile(resourceRoot, file, "program-guide"));
	}
	for (const file of pdfFiles(path.join(resourceRoot, folders.assignments))) {
		const code = normalizedCode(path.basename(file).match(/MCSL?[\s_-]?\d{3}/i)?.[0] || "");
		const configured = configuredSubjects.get(code);
		if (!configured) warnings.push(`Assignment subject could not be identified: ${path.basename(file)}`);
		files.push(contentFile(resourceRoot, file, "assignment", configured ? {
			subjectCode: configured.code,
			semester: configured.semester
		} : {}));
	}

	for (const semester of contentSetup.semesters) {
		const semesterRoot = path.join(resourceRoot, `${folders.semesterPrefix}${semester.number}`);
		for (const configured of semester.subjects) {
			const candidates = [configured.code.replaceAll("-", "_"), configured.code.replaceAll("-", "_").toLowerCase()];
			const subjectRoot = candidates.map((name) => path.join(semesterRoot, name)).find(existsSync);
			if (!subjectRoot) continue;
			for (const file of pdfFiles(path.join(subjectRoot, folders.studyMaterials))) {
				files.push(contentFile(resourceRoot, file, "study-material", {
					subjectCode: configured.code,
					semester: semester.number,
					group: path.relative(path.join(subjectRoot, folders.studyMaterials), path.dirname(file)).split(path.sep).join("/")
				}));
			}
			for (const file of pdfFiles(path.join(subjectRoot, folders.questionPapers))) {
				files.push(contentFile(resourceRoot, file, "question-paper", {
					subjectCode: configured.code,
					semester: semester.number
				}));
			}
		}
	}

	return {
		version: 1,
		generatedAt: new Date().toISOString(),
		program: contentSetup.program,
		files: files.sort((a, b) => a.path.localeCompare(b.path)),
		warnings
	};
}
