import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { env } from "../../config/env.js";
import { contentSetup } from "../../config/content.setup.js";
import { scanContent } from "./content-scanner.js";

const root = path.join(env.localResourcesRoot, contentSetup.folders.contentRoot);
const output = path.join(env.backendRoot, "data", "content.manifest.json");
const manifest = scanContent(root);

mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Content manifest: ${manifest.files.length} PDF files, ${manifest.warnings.length} warnings`);
for (const warning of manifest.warnings) console.warn(`- ${warning}`);
