import { adminRepository } from "../../../modules/admin/admin.repository.js";
import { firestoreClient } from "./firestore.client.js";

const [models, db] = await Promise.all([adminRepository.exportAllModels(), Promise.resolve(firestoreClient())]);
const results = [];
let valid = true;
for (const [collection, rows] of Object.entries(models)) {
	const firestoreCount = (await db.collection(collection).count().get()).data().count;
	const matches = rows.length === firestoreCount;
	if (!matches) valid = false;
	results.push({ collection, relational: rows.length, firestore: firestoreCount, matches });
}
console.table(results);
if (!valid) process.exitCode = 1;
