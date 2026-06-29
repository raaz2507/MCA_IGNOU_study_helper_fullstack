import { databaseConfig } from "../../infrastructure/database/database.config.js";

export function dataSourceAudit() {
	return {
		selectedAdapter: databaseConfig.adapter,
		relationalProvider: databaseConfig.provider,
		features: [
			{ feature: "catalog", source: databaseConfig.adapter, status: "connected" },
			{ feature: "feedback", source: databaseConfig.adapter, status: "connected" },
			{ feature: "authentication", source: "prisma", status: "connected" },
			{ feature: "progress", source: "prisma", status: "connected" },
			{ feature: "analytics", source: "prisma", status: "connected" },
			{ feature: "content metadata", source: "prisma", status: "connected" },
			{ feature: "PDF binaries", source: "filesystem/object-storage", status: "connected" },
			{ feature: "chat", source: "static-preview", status: "not-implemented" },
			{ feature: "discussions", source: "static-preview", status: "model-only" },
			{ feature: "forgot password", source: "none", status: "not-implemented" },
			{ feature: "theme/preferences", source: "localStorage", status: "intentional-local" }
		],
		firestoreCoverage: {
			ready: ["catalog", "feedback", "migration", "verification"],
			pending: ["authentication", "progress", "analytics", "admin", "content-management"]
		}
	};
}
