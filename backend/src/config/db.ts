import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../infrastructure/database/schema.js";

const client = createClient({
	url: "file:./gyanpath.db"
});

export const db = drizzle(client, { schema });
export { client };
