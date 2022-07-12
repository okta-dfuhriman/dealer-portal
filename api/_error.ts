import { VercelResponse } from '@vercel/node';

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

	constructor(options: any, res: VercelResponse) {
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

		const errorMap: ErrorMap = {
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

		const responseBody: TypeBody =
			errorMap[(this?.statusCode as keyof ErrorMap) || 500];

		if (this.res) {
			return this.res.status(this?.statusCode || 500).json(responseBody);
		}

		return responseBody;
	}
}
