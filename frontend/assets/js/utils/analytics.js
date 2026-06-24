import { trackVisit } from "../api/analytics.api.js";

const visitorKey = "gyanpath-anonymous-visitor";
const sessionKey = "gyanpath-session";

function randomId() {
	if (crypto.randomUUID) return crypto.randomUUID();
	const values = new Uint32Array(4);
	crypto.getRandomValues(values);
	return [...values].map((value) => value.toString(16)).join("-");
}

function storedId(storage, key) {
	let value = storage.getItem(key);
	if (!value) {
		value = randomId();
		storage.setItem(key, value);
	}
	return value;
}

function deviceType() {
	const width = window.innerWidth;
	const ua = navigator.userAgent.toLowerCase();
	if (/ipad|tablet/.test(ua) || (width >= 700 && width <= 1024)) return "tablet";
	if (/mobile|android|iphone|ipod/.test(ua) || width < 700) return "mobile";
	return "desktop";
}

function browserName() {
	const ua = navigator.userAgent;
	if (/Edg\//.test(ua)) return "Edge";
	if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Chrome";
	if (/Firefox\//.test(ua)) return "Firefox";
	if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
	return "Other";
}

export async function recordPageVisit() {
	if (navigator.doNotTrack === "1") return;
	try {
		await trackVisit({
			visitorId: storedId(localStorage, visitorKey),
			sessionId: storedId(sessionStorage, sessionKey),
			pagePath: `${window.location.pathname}${window.location.search}`,
			referrer: document.referrer,
			deviceType: deviceType(),
			browser: browserName(),
			country: null
		});
	} catch {
		// Analytics must never interrupt the study experience.
	}
}
