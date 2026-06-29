import { createHash } from "node:crypto";
import { adminRepository } from "../../../modules/admin/admin.repository.js";
import { firestoreClient } from "./firestore.client.js";

const execute = process.argv.includes("--execute");

function documentId(collection: string, row: any) {
	if (row.id != null) return String(row.id);
	if (row.key != null) return String(row.key);
	if (row.userId && row.questionId) return `${row.userId}_${row.questionId}`;
	return createHash("sha256").update(`${collection}:${JSON.stringify(row)}`).digest("hex");
}

function clean(value: any): any {
	if (value === undefined) return null;
	if (value instanceof Date) return value;
	if (Array.isArray(value)) return value.map(clean);
	if (value && typeof value === "object") {
		return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clean(item)]));
	}
	return value;
}

const models = await adminRepository.exportAllModels();
const counts = Object.fromEntries(Object.entries(models).map(([name, rows]) => [name, rows.length]));
console.log(JSON.stringify({ mode: execute ? "execute" : "dry-run", counts }, null, 2));

if (execute) {
	const db = firestoreClient();
	let batch = db.batch();
	let pending = 0;
	for (const [collection, rows] of Object.entries(models)) {
		for (const row of rows) {
			batch.set(db.collection(collection).doc(documentId(collection, row)), clean(row), { merge: true });
			pending += 1;
			if (pending === 400) {
				await batch.commit();
				batch = db.batch();
				pending = 0;
			}
		}
	}
	if (pending) await batch.commit();
	console.log("Firestore migration completed.");
}
