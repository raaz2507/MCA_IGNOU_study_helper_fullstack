export type ContentKind = "program-guide" | "assignment" | "study-material" | "question-paper";
export type ContentLanguage = "en" | "hi";

export type ContentFile = {
	id: string;
	kind: ContentKind;
	language: ContentLanguage;
	path: string;
	fileName: string;
	title: string;
	size: number;
	checksum: string;
	updatedAt: string;
	semester?: number;
	subjectCode?: string;
	group?: string;
};

export type ContentManifest = {
	version: 1;
	generatedAt: string;
	program: { code: string; title: string };
	files: ContentFile[];
	warnings: string[];
};
