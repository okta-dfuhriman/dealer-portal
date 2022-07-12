import jwksRSA, { JwksClient } from 'jwks-rsa';
import nJwt, { Verifier } from 'njwt';
import type { JwtClaims as Claims } from '@okta/jwt-verifier';

const {
	VITE_APP_OKTA_TESTING_DISABLEHTTPSCHECK: DISABLEHTTPSCHECK = false,
	VITE_APP_OKTA_USER_SERVICE_SCOPES: SERVICE_SCOPES = '',
	VITE_APP_OKTA_AUTH_SERVER_ID: AUTH_SERVER_ID,
	VITE_APP_OKTA_CLIENT_ID: CLIENT_ID,
	VITE_APP_OKTA_URL: ORG_URL,
	PROD: isProd,
} = process.env;

const ISSUER = `${ORG_URL}/oauth2/${AUTH_SERVER_ID}`;

const findDomainURL = 'https://bit.ly/finding-okta-domain';
const findAppCredentialsURL = 'https://bit.ly/finding-okta-app-credentials';

class ConfigurationValidationError extends Error {}

class AssertedClaimsVerifier {
	errors: any[];

	constructor() {
		this.errors = [];
	}

	extractOperator(claim: string) {
		const idx = claim.indexOf('.');
		if (idx >= 0) {
			return claim.substring(idx + 1);
		}
		return undefined;
	}

	extractClaim(claim: string) {
		const idx = claim.indexOf('.');
		if (idx >= 0) {
			return claim.substring(0, idx);
		}
		return claim;
	}

	isValidOperator(operator: string | undefined) {
		// may support more operators in the future
		return !operator || operator === 'includes';
	}

	checkAssertions(
		op: 'includes' | undefined,
		claim: string,
		expectedValue: string | string[] | undefined,
		actualValue: string | string[] | undefined
	) {
		if (!op && actualValue !== expectedValue) {
			this.errors.push(
				`claim '${claim}' value '${actualValue}' does not match expected value '${expectedValue}'`
			);
		} else if (op === 'includes' && Array.isArray(expectedValue)) {
			expectedValue.forEach((value) => {
				if (!actualValue || !actualValue.includes(value)) {
					this.errors.push(
						`claim '${claim}' value '${actualValue}' does not include expected value '${value}'`
					);
				}
			});
		} else if (
			op === 'includes' &&
			(!actualValue || !actualValue?.includes(expectedValue as string))
		) {
			this.errors.push(
				`claim '${claim}' value '${actualValue}' does not include expected value '${expectedValue}'`
			);
		}
	}
}

const assertIssuer = (issuer: string) => {
	const isHttps = new RegExp('^https://');
	const hasDomainAdmin = /-admin.(okta|oktapreview|okta-emea).com/;
	const copyMessage =
		'You can copy your domain from the Okta Developer ' +
		'Console. Follow these instructions to find it: ' +
		findDomainURL;

	if (DISABLEHTTPSCHECK) {
		const httpsWarning =
			'Warning: HTTPS check is disabled. ' +
			'This allows for insecure configurations and is NOT recommended for production use.';

		console.warn(httpsWarning);
	}

	if (!issuer) {
		throw new ConfigurationValidationError(
			`Your Okta URL is missing. ${copyMessage}`
		);
	} else if (!DISABLEHTTPSCHECK && !issuer.match(isHttps)) {
		throw new ConfigurationValidationError(
			`Your Okta URL must start with https. Current value: ${issuer} ${copyMessage}`
		);
	} else if (issuer.match(/{yourOktaDomain}/)) {
		throw new ConfigurationValidationError(
			'Replace {yourOktaDomain} with your Okta domain. ' + copyMessage
		);
	} else if (issuer.match(hasDomainAdmin)) {
		throw new ConfigurationValidationError(
			`Your Okta domain should not contain -admin. Current value: ${issuer}. ${copyMessage}`
		);
	}
};

const assertClientId = (clientId: string | undefined) => {
	const copyCredentialsMessage =
		'You can copy it from the Okta Developer Console ' +
		'in the details for the Application you created. ' +
		`Follow these instructions to find it: ${findAppCredentialsURL}`;

	if (!clientId) {
		throw new ConfigurationValidationError(
			`Your client ID is missing. ${copyCredentialsMessage}`
		);
	} else if (clientId.match(/{clientId}/)) {
		throw new ConfigurationValidationError(
			`Replace {clientId} with the client ID of your Application. ${copyCredentialsMessage}`
		);
	}
};

const verifyAssertedClaims = (verifier: JwtVerifier, claims: Claims) => {
	const assertedClaimsVerifier = new AssertedClaimsVerifier();
	for (const [claimName, expectedValue] of Object.entries(
		verifier.claimsToAssert
	)) {
		const operator = assertedClaimsVerifier.extractOperator(claimName);
		if (!assertedClaimsVerifier.isValidOperator(operator)) {
			throw new Error(
				`operator: '${operator}' invalid. Supported operators: 'includes'.`
			);
		}
		const claim = assertedClaimsVerifier.extractClaim(claimName);
		const actualValue: any = claims[claim];
		assertedClaimsVerifier.checkAssertions(
			operator as 'includes',
			claim,
			expectedValue,
			actualValue
		);
	}
	if (assertedClaimsVerifier.errors.length) {
		throw new Error(assertedClaimsVerifier.errors.join(', '));
	}
};

export default class JwtVerifier {
	issuer: string;
	clientId: string;
	claimsToAssert: object;
	jwksUri: string;
	jwksClient: JwksClient;
	verifier: Verifier;

	constructor(options?: {
		issuer?: string;
		clientId?: string;
		assertClaims?: object;
	}) {
		this.issuer = options?.issuer || ISSUER;
		this.clientId = options?.clientId || CLIENT_ID!;

		assertIssuer(this.issuer);
		assertClientId(this.clientId);

		this.claimsToAssert = options?.assertClaims || {};
		this.jwksUri = this.issuer + '/v1/keys';
		this.jwksClient = jwksRSA({
			jwksUri: this.jwksUri,
			cache: true,
			cacheMaxAge: 60 * 60 * 1000,
			cacheMaxEntries: 3,
			jwksRequestsPerMinute: 10,
			rateLimit: true,
		});

		this.verifier = nJwt
			.createVerifier()
			.setSigningAlgorithm('RS256')
			.withKeyResolver((kid, cb) => {
				if (kid) {
					this.jwksClient.getSigningKey(kid, (err, key) => {
						let _key: string = '';

						if (key) {
							_key =
								'publicKey' in key
									? key.publicKey
									: key.rsaPublicKey;
						}
						return cb(err, _key);
					});
				} else {
					return cb(new Error('No KID specified'), '');
				}
			});
	}

	async verifyAsPromise(tokenString: string, verifier = this.verifier) {
		return new Promise<Claims>((resolve, reject) => {
			verifier.verify(tokenString, (err, jwt) => {
				if (err) {
					return reject(err);
				}
				let claims: Claims = {
					...(jwt.body as unknown as Claims),
				};

				resolve(claims);
			});
		});
	}

	async verifyIdToken(idTokenString: string) {
		// njwt verifies expiration and signature
		// We require RS256 in the base verifier
		// Issuer is validated by constructor
		// Audience claim is validated by constructor (clientId)
		//
		// Remaining to verify:
		// - any custom claims

		const claims = await this.verifyAsPromise(idTokenString);

		verifyAssertedClaims(this, claims);

		return claims;
	}
}
