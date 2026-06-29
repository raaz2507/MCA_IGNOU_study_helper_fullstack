import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { env } from "../../../config/env.js";

let cached: Firestore | null = null;

export function firestoreClient() {
	if (cached) return cached;
	const credential = env.firebaseClientEmail && env.firebasePrivateKey
		? cert({
			projectId: env.firebaseProjectId,
			clientEmail: env.firebaseClientEmail,
			privateKey: env.firebasePrivateKey.replace(/\\n/g, "\n")
		})
		: applicationDefault();
	const app = getApps()[0] || initializeApp({ credential, projectId: env.firebaseProjectId });
	cached = getFirestore(app, env.firestoreDatabaseId);
	return cached;
}
