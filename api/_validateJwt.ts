import OktaJwtVerifier from '@okta/jwt-verifier';

import { JwtVerifier as CustomJwtVerifier, ErrorResponse } from './_common';

import type { VercelRequest, VercelResponse } from '@vercel/node';

const {
	VITE_APP_OKTA_URL: ORG_URL,
	VITE_APP_OKTA_AUTH_SERVER_ID: AUTH_SERVER_ID = 'default',
	VITE_APP_OKTA_AUD: AUD = 'api://dealer-portal',
} = process.env;

if (!ORG_URL) {
	throw new Error(
		'Missing required `VITE_APP_OKTA_URL` environmental variable.'
	);
}
const ISSUER = `${ORG_URL}/oauth2/${AUTH_SERVER_ID}`;
interface AssertClaims {
	'permissions.includes'?: string[];
	'scp.includes'?: string[];
}

interface Assertions {
	permissions?: string[];
	scopes?: string[];
}

export interface ValidateJwtOptions {
	idTokenString?: string;
	accessTokenString?: string;
	aud?: string;
	issuer?: string;
	assertions?: Assertions;
	id?: string;
	alwaysDecode?: boolean;
}

export interface ValidateResult {
	isValid: boolean;
	accessToken?: OktaJwtVerifier.Jwt | undefined;
	idToken?: OktaJwtVerifier.Jwt | undefined;
	error?: Error | undefined;
}

export default class JwtValidator {
	req: VercelRequest;
	res?: VercelResponse;
	idTokenString?: ValidateJwtOptions['idTokenString'];
	accessTokenString?: ValidateJwtOptions['accessTokenString'];
	aud: ValidateJwtOptions['aud'];
	issuer: ValidateJwtOptions['issuer'];
	assertions?: ValidateJwtOptions['assertions'];
	id?: ValidateJwtOptions['id'];
	alwaysDecode: ValidateJwtOptions['alwaysDecode'];

	constructor(
		req: VercelRequest,
		{ aud, issuer, alwaysDecode, ...options }: ValidateJwtOptions,
		res?: VercelResponse
	) {
		this.req = req;
		this.res = res;
		this.issuer = issuer || ISSUER;
		this.aud = aud || AUD;
		this.alwaysDecode = alwaysDecode || true;

		for (const [key, value] of Object.entries(options)) {
			const _key = key as keyof ValidateJwtOptions;

			this[_key] = value;
		}

		if (!this?.accessTokenString) {
			const {
				headers: { authorization },
			} = this.req;

			if (authorization) {
				const regex = /Bearer (.+)/;
				const match = regex.exec(authorization);

				this.accessTokenString =
					match?.length === 2 ? match[1] : undefined;
			}
		}

		if (!this?.accessTokenString && !this?.idTokenString) {
			throw new Error('No JWT found!');
		}
	}

	async validateAccessToken({
		assertClaims,
		issuer,
		...options
	}: OktaJwtVerifier.VerifierOptions): Promise<ValidateResult> {
		if (!this?.accessTokenString) {
			throw new Error('No accessToken!');
		}

		let result: ValidateResult = {
			isValid: false,
		};

		const aud = this.aud!;
		const decode = this.alwaysDecode!;

		try {
			let jwtVerifier = new OktaJwtVerifier({ issuer });

			// first pass to get claims
			// will return this as long as it is valid regardless assertClaims step validation.
			result['accessToken'] = await jwtVerifier.verifyAccessToken(
				this.accessTokenString,
				aud
			);
			result.isValid = true;
			console.log(assertClaims);
			// Now, if provided, we assert the claims.
			// This may throw, but we still want to return the decoded JWT (if decode === true)
			if (assertClaims) {
				const { isValid, accessToken } =
					await this.validateAccessTokenWithAssertions({
						assertClaims,
						issuer,
						...options,
					});

				result.isValid = isValid;

				if (isValid) {
					result.accessToken = accessToken;
				}

				if (!decode && result?.accessToken) {
					delete result.accessToken;
				}
			}

			return result;
		} catch (error: any) {
			return { isValid: false, error };
		}
	}

	async validateAccessTokenWithAssertions(
		options: OktaJwtVerifier.VerifierOptions,
		result: ValidateResult = { isValid: false }
	) {
		try {
			const jwtVerifier = new OktaJwtVerifier(options);

			result['accessToken'] = await jwtVerifier.verifyAccessToken(
				this.accessTokenString!,
				this.aud!
			);
			result.isValid = true;
		} catch (error) {
			if (this.alwaysDecode) {
				result.isValid = false;
			} else {
				throw new Error(
					`Unable to assert required claims:\n${JSON.stringify(
						options.assertClaims!
					)}\n\nJWT not valid!`
				);
			}
		}

		return result;
	}

	async validateIdToken({
		issuer,
	}: OktaJwtVerifier.VerifierOptions): Promise<ValidateResult> {
		if (!this?.idTokenString) {
			throw new Error('No accessToken!');
		}

		try {
			const jwtVerifier = new CustomJwtVerifier({ issuer });

			return {
				idToken: await jwtVerifier.verifyIdToken(this.idTokenString),
				isValid: true,
			};
		} catch (error: any) {
			return { isValid: false, error };
		}
	}

	async generateAssertions(_assertions?: Assertions): Promise<AssertClaims> {
		const assertions = _assertions || this?.assertions;

		if ((assertions?.permissions?.length || []) > 0) {
			return {
				'permissions.includes': assertions!.permissions,
			};
		}

		return {
			'scp.includes': assertions?.scopes || [],
		};
	}

	async validateTokens(assertions?: Assertions, decode?: boolean) {
		const result: ValidateResult = {
			isValid: false,
		};

		if (typeof decode !== 'undefined') {
			this.alwaysDecode = decode;
		}

		try {
			const issuer = this.issuer!;
			const assertClaims = (await this.generateAssertions(
				assertions
			)) as Record<string, unknown>;

			// Attempt to validate idToken if available.
			if (this?.idTokenString) {
				const { isValid, idToken } = await this.validateIdToken({
					assertClaims,
					issuer,
				});

				result.isValid = isValid;
				result['idToken'] = idToken;
			}

			if (this?.accessTokenString) {
				if (assertClaims && !this.alwaysDecode) {
					return await this.validateAccessTokenWithAssertions({
						assertClaims,
						issuer,
					});
				}

				const { isValid, accessToken } = await this.validateAccessToken(
					{
						assertClaims,
						issuer,
					}
				);

				result.isValid = isValid;
				result['accessToken'] = accessToken;
			}
		} catch (error: any) {
			console.error(error);

			result.isValid = false;
			result['error'] = error;

			if (this?.res) {
				return new ErrorResponse(error, this.res).send(401);
			}
		}

		return result;
	}
}
