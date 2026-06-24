export class AppError extends Error {
	constructor(
		public status: number,
		message: string,
		public code = "APPLICATION_ERROR"
	) {
		super(message);
	}
}

