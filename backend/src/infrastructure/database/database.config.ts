import { z } from "zod";
import { env } from "../../config/env.js";

export const databaseAdapterSchema = z.enum(["prisma", "firestore"]);
export type DatabaseAdapter = z.infer<typeof databaseAdapterSchema>;

export const databaseConfig = Object.freeze({
	adapter: databaseAdapterSchema.parse(process.env.DATABASE_ADAPTER || "prisma"),
	provider: env.databaseProvider
});
