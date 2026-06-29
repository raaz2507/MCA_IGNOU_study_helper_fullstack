import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const prismaRoot = path.resolve(process.cwd(), "backend", "prisma");
const canonicalPath = path.join(prismaRoot, "schema.prisma");
const canonical = readFileSync(canonicalPath, "utf8");
const enumNames = ["UserRole", "QuestionStatus", "UserStatus", "PublishStatus", "ReportStatus"];

function schemaFor(provider: "postgresql" | "mysql" | "sqlite") {
	let schema = canonical.replace(/provider\s*=\s*"postgresql"/, `provider = "${provider}"`);
	if (provider === "mysql") {
		schema = schema.replace('url      = env("DATABASE_URL")', 'url      = "mysql://user:password@localhost:3306/gyanpath"');
	}
	if (provider === "sqlite") {
		schema = schema.replace('url      = env("DATABASE_URL")', 'url      = "file:./gyanpath.db"');
	}
	if (provider === "sqlite") {
		for (const enumName of enumNames) {
			schema = schema.replace(new RegExp(`enum\\s+${enumName}\\s*\\{[^}]*\\}\\s*`, "s"), "");
			schema = schema.replace(new RegExp(`(\\s+\\w+\\s+)${enumName}(\\??)(?=\\s)`, "g"), "$1String$2");
		}
		schema = schema.replace(/@default\((USER|EDITOR|MODERATOR|ADMIN|PENDING|PUBLISHED|ACTIVE|SUSPENDED|BANNED|DRAFT|ARCHIVED|OPEN|REVIEWING|RESOLVED|DISMISSED)\)/g, '@default("$1")');
	}
	return `// Generated from backend/prisma/schema.prisma. Do not edit manually.\n${schema.trim()}\n`;
}

for (const provider of ["postgresql", "mysql", "sqlite"] as const) {
	const providerRoot = path.join(prismaRoot, "providers", provider);
	mkdirSync(path.join(providerRoot, "migrations", "00000000000000_init"), { recursive: true });
	writeFileSync(path.join(providerRoot, "schema.prisma"), schemaFor(provider), "utf8");
	writeFileSync(path.join(providerRoot, "migrations", "migration_lock.toml"), `# Generated provider migration lock\nprovider = "${provider}"\n`, "utf8");
}

console.log("Generated Prisma schemas for postgresql, mysql and sqlite.");
