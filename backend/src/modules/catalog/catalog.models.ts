export type CatalogSubject = {
	id: string;
	code: string;
	title: string;
	semester: number;
	type: string;
	folderPath: string;
	htmlViewerPath: string | null;
	questionBank: boolean;
	studyMaterials: Array<{ groupName: string; title: string; filePath: string }>;
	_count: { papers: number };
};

export type CatalogPaper = {
	id: string;
	title: string;
	session: string;
	englishPath: string;
	hindiPath: string | null;
	previewPath: string | null;
	fileName: string;
	pageCount: number | null;
	fileSize: number | null;
	updatedAt: Date;
	subject: { code: string };
};
