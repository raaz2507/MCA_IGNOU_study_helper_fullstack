import assert from "node:assert/strict";
import test from "node:test";
import { dataSourceAudit } from "../modules/admin/data-source-audit.js";

test("data-source audit identifies connected and intentionally local features", () => {
	const audit = dataSourceAudit();
	assert.equal(audit.features.find((item) => item.feature === "feedback")?.status, "connected");
	assert.equal(audit.features.find((item) => item.feature === "theme/preferences")?.status, "intentional-local");
	assert.ok(audit.features.some((item) => item.status === "not-implemented"));
});
