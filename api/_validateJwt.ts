import type { VercelRequest } from '@vercel/node';
import OktaJwtVerifier, { JwtClaims as Claims } from '@okta/jwt-verifier';
import { JwtVerifier } from './_common';

const {
	VITE_APP_OKTA_URL: ORG_URL,
	VITE_APP_OKTA_AUTH_SERVER_ID: AUTH_SERVER_ID,
	VITE_APP_OKTA_AUD: AUD = 'api://dealer-portal',
} = process.env;

const ISSUER = `${ORG_URL}/oauth2/${AUTH_SERVER_ID}`;

/**
 *
 * @param {Object} options An options object containing any of the following: idToken, accessToken, an `aud` value, and any custom claims to assert (in an `assertClaims` object).
 * @param {Object} [req] The original `req` object. Used to perform additional validation.
 * @param {Object} [client] An instance of OktaClient. Used to validate parent/child relationship (if necessary).
 * @returns {Object} The results of the validation as well as the accessToken validated.
 */

export interface ValidateJwtOptions {
	idToken?: string;
	accessToken?: string;
	aud?: string;
	assertClaims?: { 'scp.includes': string[] };
}

interface ValidateResult {
	isValid: boolean;
	accessToken?: Claims | undefined;
	idToken?: Claims | undefined;
	error?: Error | undefined;
}

const validateJwt = async (
	options: ValidateJwtOptions | undefined,
	req: VercelRequest
): Promise<ValidateResult> => {
	const { idToken, accessToken, aud = AUD!, assertClaims } = options || {};
	let _accessTokenString = accessToken;
	let _idTokenString = idToken;

	const result: ValidateResult = {
		isValid: false,
		accessToken: undefined,
		idToken: undefined,
	};

	try {
		const {
			headers: { authorization },
		} = req || {};

		// 1) If there is an idToken, validate it.
		if (_idTokenString) {
			// Spin up a validator
			const customJwtVerifier = new JwtVerifier();

			result.idToken = await customJwtVerifier.verifyIdToken(
				_idTokenString
			);

			result.isValid = true;
		}

		// 2) If there is not an accessToken extract from `req`.
		if (!_accessTokenString && authorization) {
			const regex = /Bearer (.+)/;
			const match = regex.exec(authorization);

			_accessTokenString = match?.length === 2 ? match[1] : undefined;
		}

		if (!_accessTokenString && !_idTokenString) {
			throw new Error('No JWT found!');
		}

		// 3) If there is an accessToken, validate it
		if (_accessTokenString) {
			// i) Spin up our jwtVerifier
			let jwtVerifier = new OktaJwtVerifier({
				issuer: ISSUER,
				assertClaims,
			});

			// ii) Do the initial/basic JWT validation
			const { claims } =
				(await jwtVerifier.verifyAccessToken(
					_accessTokenString,
					aud
				)) || {};

			result.accessToken = claims;
			result.isValid = true;
		}

		return result;
	} catch (error: any) {
		return { isValid: false, error };
	}
};

export default validateJwt;
