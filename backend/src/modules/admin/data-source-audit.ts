import { databaseConfig } from "../../infrastructure/database/database.config.js";

export function dataSourceAudit() {
	return {
		selectedAdapter: databaseConfig.adapter,
		relationalProvider: databaseConfig.provider,
		features: [
			{ feature: "catalog", source: databaseConfig.adapter, status: "connected" },
			{ feature: "feedback", source: databaseConfig.adapter, status: "connected" },
			{ feature: "authentication", source: databaseConfig.adapter, status: "connected" },
			{ feature: "progress", source: databaseConfig.adapter, status: "connected" },
			{ feature: "analytics", source: databaseConfig.adapter, status: "connected" },
			{ feature: "content metadata", source: databaseConfig.adapter, status: "connected" },
			{ feature: "PDF binaries", source: "filesystem/object-storage", status: "connected" },
			{ feature: "chat", source: "static-preview", status: "not-implemented" },
			{ feature: "discussions", source: "static-preview", status: "model-only" },
			{ feature: "forgot password", source: "none", status: "not-implemented" },
			{ feature: "theme/preferences", source: "localStorage", status: "intentional-local" }
		]
	};
}
