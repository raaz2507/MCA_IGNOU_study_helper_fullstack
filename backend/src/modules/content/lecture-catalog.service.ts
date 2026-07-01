import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { contentRepository } from "./content.repository.js";

const catalogPath = path.join(env.projectRoot, "content", "video-lectures.json");

const lectureSchema = z.object({
	id: z.string().trim().min(2).max(120),
	subject: z.string().trim().min(2).max(30).transform((value) => value.toUpperCase()),
	title: z.string().trim().min(2).max(200),
	unit: z.string().trim().max(120).default(""),
	description: z.string().trim().max(500).default(""),
	url: z.string().trim().url().max(600).refine((value) => /^https?:\/\//i.test(value), "URL must use http:// or https://."),
	teacher: z.string().trim().max(160).default(""),
	language: z.string().trim().min(2).max(60).default("Hindi"),
	order: z.number().int().min(0).max(999).default(0),
	active: z.boolean().default(true)
}).strict();

const catalogSchema = z.object({
	schemaVersion: z.literal(1),
	lectures: z.array(lectureSchema).max(5000)
}).strict();

type LectureCatalog = z.infer<typeof catalogSchema>;

function issueText(issue: z.core.$ZodIssue) {
	const location = issue.path.length ? issue.path.join(".") : "catalog";
	return `${location}: ${issue.message}`;
}

async function validateValue(value: unknown) {
	const parsed = catalogSchema.safeParse(value);
	if (!parsed.success) return { valid: false as const, errors: parsed.error.issues.map(issueText) };

	const errors: string[] = [];
	const seen = new Set<string>();
	parsed.data.lectures.forEach((lecture, index) => {
		if (seen.has(lecture.id)) errors.push(`lectures.${index}.id: Duplicate id "${lecture.id}".`);
		seen.add(lecture.id);
	});

	const subjects = await contentRepository.subjectCodes();
	parsed.data.lectures.forEach((lecture, index) => {
		if (!subjects.has(lecture.subject)) {
			errors.push(`lectures.${index}.subject: Subject "${lecture.subject}" does not exist in the database.`);
		}
	});
	return errors.length
		? { valid: false as const, errors }
		: { valid: true as const, errors: [], catalog: parsed.data };
}

async function parseAndValidate(content: string) {
	let value: unknown;
	try {
		value = JSON.parse(content);
	} catch (error) {
		return {
			valid: false as const,
			errors: [`JSON syntax: ${error instanceof Error ? error.message : "Invalid JSON."}`]
		};
	}
	return validateValue(value);
}

async function readText() {
	try {
		return await fs.readFile(catalogPath, "utf8");
	} catch (error: any) {
		if (error?.code !== "ENOENT") throw error;
		return `${JSON.stringify({ schemaVersion: 1, lectures: [] }, null, 2)}\n`;
	}
}

function assertValid(result: Awaited<ReturnType<typeof parseAndValidate>>): asserts result is {
	valid: true;
	errors: [];
	catalog: LectureCatalog;
} {
	if (!result.valid) {
		throw new AppError(400, result.errors.join("\n"), "INVALID_LECTURE_CATALOG");
	}
}

export const lectureCatalogService = {
	async read() {
		const content = await readText();
		return { content, ...(await parseAndValidate(content)) };
	},
	validate(content: string) {
		return parseAndValidate(content);
	},
	async save(content: string) {
		const result = await parseAndValidate(content);
		assertValid(result);
		const formatted = `${JSON.stringify(result.catalog, null, 2)}\n`;
		await fs.mkdir(path.dirname(catalogPath), { recursive: true });
		const temporaryPath = `${catalogPath}.${process.pid}.tmp`;
		await fs.writeFile(temporaryPath, formatted, "utf8");
		await fs.rename(temporaryPath, catalogPath);
		return { content: formatted, valid: true, errors: [] };
	},
	async sync(updateExisting: boolean) {
		const result = await parseAndValidate(await readText());
		assertValid(result);
		return contentRepository.syncLectureCatalog(result.catalog.lectures, updateExisting);
	}
};
