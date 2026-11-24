import path from "node:path";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../infrastructure/database/schema.js";
import { env } from "./env.js";

const dbPath = path.resolve(env.backendRoot, "data", "gyanpath.db").replace(/\\/g, "/");
const client = createClient({
	url: `file:${dbPath}`
});

export const db = drizzle(client, { schema });
export { client };
