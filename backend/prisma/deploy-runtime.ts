import { spawnSync } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";

const projectRoot = process.cwd();
dotenv.config({ path: path.join(projectRoot, ".env"), override: true });
const prismaCli = path.join(projectRoot, "node_modules", "prisma", "build", "index.js");
const schema = path.join(projectRoot, "backend", "prisma", "schema.prisma");
const result = spawnSync(process.execPath, [prismaCli, "migrate", "deploy", "--schema", schema], {
	stdio: "inherit",
	env: process.env
});
process.exitCode = result.status ?? 1;
