import type { VercelResponse } from '@vercel/node';

export class ApiError extends Error {
	statusCode: string | number;
	name: string;

	constructor({
		message,
		statusCode,
	}: {
		message?: string;
		statusCode: string | number;
	}) {
		super(message);

		this.statusCode = statusCode;
		this.name = 'ApiError';
	}
}

interface TypeBody {
	statusCode?: number;
	error?: Error;
	errorSummary?: string;
	errorCode?: string | number;
	errorMessage?: string;
	errorType?: string | number;
	errorStack?: string;
}

interface ErrorMap {
	[key: number]: TypeBody;
}

type ErrorResponseOptions = Error | string | number | VercelResponse | TypeBody;
export class ErrorResponse {
	res?: VercelResponse;
	body?: TypeBody;
	statusCode?: TypeBody['statusCode'];
	error?: TypeBody['error'];
	errorSummary?: TypeBody['errorSummary'];
	errorCode?: TypeBody['errorCode'];
	errorMessage?: TypeBody['errorMessage'];
	errorType?: TypeBody['errorType'];
	errorStack?: TypeBody['errorStack'];
	responseBody?: TypeBody;

	constructor(options: ErrorResponseOptions, res?: VercelResponse) {
		this.res = res;
		this.statusCode = 500;

		if (res) {
			this.res = res;
		} else if (!res && options.hasOwnProperty('send')) {
			this.res = options as VercelResponse;
		} else if (options instanceof Error) {
			this.error = options;
		} else if (typeof options === 'string') {
			this.errorSummary = options;
		} else if (typeof options === 'number') {
			this.statusCode = options;
		} else {
			const { errorCode, errorSummary, statusCode } = options as TypeBody;

			this.errorCode = errorCode || this.errorCode;
			this.errorSummary = errorSummary || this.errorSummary;
			this.statusCode = statusCode || this.statusCode;
		}

		if (this.error instanceof Error) {
			const { message, name: code, stack } = this.error;

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
	}

	errorMap: ErrorMap = {
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

	send(statusCode: number) {
		if (!this?.res) {
			throw new Error(
				'Must initiate with `res` in order to send a response.'
			);
		}

		if (statusCode) {
			this.statusCode = statusCode;
		}

		this.responseBody = this.errorMap[this.statusCode!] || {};

		return this.res.status(this.statusCode!).json(this.responseBody);
	}
}
