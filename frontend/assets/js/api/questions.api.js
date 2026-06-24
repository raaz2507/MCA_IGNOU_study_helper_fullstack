import { apiRequest } from "./client.js";

export const getQuestionManifest = (subject) =>
	apiRequest(`/questions/manifest?subject=${encodeURIComponent(subject)}`);

export const getQuestionContent = (subject, file) =>
	apiRequest(
		`/questions/item?subject=${encodeURIComponent(subject)}&file=${encodeURIComponent(file)}`
	);
