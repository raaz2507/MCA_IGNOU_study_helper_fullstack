const API_BASE_URL = window.GYANPATH_API_URL || "/api";

export async function apiRequest(path, options = {}) {
	let response;
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				...(options.headers || {})
			},
			...options
		});
	} catch {
		throw new Error("Application server is offline. Start it with npm start and reload this page.");
	}

	if (
		response.status === 401
		&& path !== "/auth/login"
		&& path !== "/auth/refresh"
		&& path !== "/auth/logout"
	) {
		const refreshed = await fetch(`${API_BASE_URL}/auth/refresh`, {
			method: "POST",
			credentials: "include"
		});
		if (refreshed.ok) {
			response = await fetch(`${API_BASE_URL}${path}`, {
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					...(options.headers || {})
				},
				...options
			});
		}
	}

	if (!response.ok) {
		const payload = await response.json().catch(() => ({}));
		const error = new Error(payload.message || `API request failed with status ${response.status}`);
		error.status = response.status;
		throw error;
	}

	if (response.status === 204) return null;
	return response.json();
}
