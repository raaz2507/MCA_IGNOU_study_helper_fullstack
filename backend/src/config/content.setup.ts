export type SubjectSetup = {
	code: string;
	title: string;
	type: "theory" | "practical" | "project";
};

export type SemesterSetup = {
	number: number;
	title: string;
	subjects: readonly SubjectSetup[];
};

const subject = (code: string, title: string, type: SubjectSetup["type"] = "theory"): SubjectSetup => ({
	code,
	title,
	type
});

/**
 * Stable bootstrap data only. PDF entries are discovered from the resource
 * folders and must not be maintained by hand in this file.
 */
export const contentSetup = Object.freeze({
	program: {
		code: "MCA_NEW",
		title: "Master of Computer Applications"
	},
	fallbacks: {
		pdfPreview: "/assets/images/pdf-preview-fallback.svg",
		banner: "/assets/images/gyanpath-link-preview-banner.webp",
		contributor: "/assets/images/avatar-fallback.webp",
		supportQr: "/assets/images/support-gyanpath-fallback.webp"
	},
	folders: {
		contentRoot: "MCA_new",
		semesterPrefix: "Semester_",
		studyMaterials: "study_material",
		questionPapers: "exam_papers",
		assignments: "assignments",
		programGuides: "program_guide"
	},
	semesters: [
		{ number: 1, title: "Semester 1", subjects: [
			subject("MCS-211", "Design and Analysis of Algorithms"),
			subject("MCS-212", "Discrete Mathematics"),
			subject("MCS-213", "Software Engineering"),
			subject("MCS-214", "Professional Skills and Ethics"),
			subject("MCS-215", "Security and Cyber Laws"),
			subject("MCSL-216", "DAA and Web Design Lab", "practical"),
			subject("MCSL-217", "Software Engineering Lab", "practical")
		] },
		{ number: 2, title: "Semester 2", subjects: [
			subject("MCS-218", "Data Communication and Computer Networks"),
			subject("MCS-219", "Object Oriented Analysis and Design"),
			subject("MCS-220", "Web Technologies"),
			subject("MCS-221", "Data Warehousing and Data Mining"),
			subject("MCSL-222", "OOAD and Web Technologies Lab", "practical"),
			subject("MCSL-223", "Computer Networks and Data Mining Lab", "practical")
		] },
		{ number: 3, title: "Semester 3", subjects: [
			subject("MCS-224", "Artificial Intelligence and Machine Learning"),
			subject("MCS-225", "Accountancy and Financial Management"),
			subject("MCS-226", "Data Science and Big Data"),
			subject("MCS-227", "Cloud Computing and IoT"),
			subject("MCSL-228", "Artificial Intelligence and Machine Learning Lab", "practical"),
			subject("MCSL-229", "Cloud and Data Science Lab", "practical")
		] },
		{ number: 4, title: "Semester 4", subjects: [
			subject("MCS-230", "Digital Image Processing and Computer Vision"),
			subject("MCS-231", "Mobile Computing"),
			subject("MCS-232", "Project Guidelines", "project")
		] }
	] satisfies readonly SemesterSetup[]
});

export const configuredSubjects = new Map(
	contentSetup.semesters.flatMap((semester) => semester.subjects.map((item) => [item.code, {
		...item,
		semester: semester.number
	}] as const))
);
