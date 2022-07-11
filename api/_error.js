export class ApiError extends Error {
	constructor({ message, statusCode }) {
		super(message);

		this.statusCode = statusCode;
		this.name = 'ApiError';
	}
}

export class ErrorResponse {
	constructor(options, res) {
		this.res = res;
		this.statusCode = 500;

		if (options instanceof Error) {
			this.error = options;
		} else if (typeof options === 'string') {
			this.errorSummary = options;
		} else if (typeof options === 'number') {
			this.statusCode = options;
		} else {
			this.errorCode = options?.errorCode || this.errorCode;
			this.errorSummary = options?.errorSummary || this.errorSummary;
			this.statusCode = options?.statusCode || this.statusCode;
		}

		if (this.error instanceof Error) {
			const { message, code, stack } = this.error;

			this.errorMessage = message;
			this.errorType = code;
			this.errorStack = stack;
		}

		this.body = {
			errorCode: this.errorCode,
			errorSummary: this.errorSummary,
			errorMessage: this.errorMessage,
			errorType: this.errorType,
			errorStack: this.errorStack,
		};

		const errorMap = {
			401: {
				errorSummary: 'Authorization failed',
				errorCode: 'E0000004',
				...this.body,
			},
			403: {
				...this.body,
			},
			500: {
				errorCode: 'E0000009',
				errorSummary: 'Internal Server Error',
				...this.body,
			},
			501: {
				errorCode: 'E0000060',
				errorSummary: 'Unsupported operation.',
				...this.body,
			},
		};

		const responseBody = errorMap[this.statusCode];

		if (this.res) {
			return this.res.status(this.statusCode).json(responseBody);
		}

		return responseBody;
	}
}
