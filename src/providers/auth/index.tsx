import type { AuthProvider as RaAuthProvider, UserIdentity } from 'react-admin';
import type {
	OktaAuth as OktaAuthType,
	Tokens,
	UserClaims as OktaUserClaims,
	AccessToken as OktaAccessToken,
} from '@okta/okta-auth-js';

type UserClaims = OktaUserClaims & {
	scopes: string[];
	permissions?: string[];
};

const silentAuth = async (
	sdk: OktaAuthType,
	options?: { hasSession?: boolean; isAuthenticated?: boolean }
) => {
	const { hasSession: _hasSession, isAuthenticated: _isAuthenticated } =
		options || {};

	let authState = sdk.authStateManager.getAuthState();
	let isAuthenticated = _isAuthenticated || authState?.isAuthenticated;

	// If we are not sure if the user is already authenticated, double check.
	if (_isAuthenticated === undefined) {
		// Checks if we can get tokens using either a refresh_token or, if our tokens are expired, if getWithoutPrompt works.
		isAuthenticated = (await sdk.isAuthenticated()) || false;
	}

	if (!isAuthenticated) {
		const hasSession = _hasSession || (await sdk.session.exists());

		if (hasSession) {
			// Have a session but no tokens in tokenManager.
			// ** Hail Mary attempt to authenticate via existing session. **

			const { tokens } = await sdk.token.getWithoutPrompt();

			if (tokens) {
				await sdk.tokenManager.setTokens(tokens);

				authState = await sdk.authStateManager.updateAuthState();
			}
		}
	}

	return isAuthenticated || false;
};

const getTokens = async (sdk: OktaAuthType) =>
	await sdk.tokenManager.getTokens();

const handleLogout = async (sdk: OktaAuthType) => {
	const isAuthenticated = await sdk.isAuthenticated();

	if (!isAuthenticated) {
		return false;
	}

	console.info('executing logout...');

	// 1) Clear Idp sessions and revoke all tokens
	const tokens = (await sdk.tokenManager.getTokens()) || {};

	let userId: string;

	if (tokens?.accessToken) {
		const {
			claims: { uid },
		}: OktaAccessToken = tokens.accessToken;

		userId = uid as string;

		if (userId) {
			const url = `${window.location.origin}/api/v1/users/${userId}/sessions`;

			const response = await fetch(url, { method: 'DELETE' });

			if (!response.ok) {
				const json = await response.json();

				console.error(json);
				throw false;
			}
		}
	}

	// 3) Do Okta Sign Out, which results in a redirect.
	await sdk.signOut();

	return await sdk.isAuthenticated();
};

export default class AuthProvider {
	oktaAuth: OktaAuthType;
	constructor(oktaAuth: OktaAuthType) {
		this.oktaAuth = oktaAuth;
	}

	init() {
		return {
			// called when the user attempts to log in
			login: () => {
				if (this.oktaAuth.isLoginRedirect()) {
					console.info('Handling login redirect!');
					this.oktaAuth.setOriginalUri(window.location.origin);

					return this.oktaAuth.handleLoginRedirect();
				}
				console.info('Handling sign in w/ redirect!');
				return this.oktaAuth.signInWithRedirect();
			},
			// called when the user clicks on the logout button
			logout: () => {
				return handleLogout(this.oktaAuth)
					.then((isAuthenticated) => {
						if (!isAuthenticated) {
							return Promise.resolve();
						}

						return Promise.reject();
					})
					.catch((error: any) => {
						console.error(error);
						return Promise.reject();
					});
			},
			// called when the API returns an error
			checkError: ({
				status,
				message,
			}: {
				message: string;
				status: number;
			}) => {
				if (message) {
					console.error(message);
				}

				if (status === 401 || status === 403) {
					return Promise.reject();
				}
				return Promise.resolve();
			},
			// checkError: ({ status }: { message: string; status: number }) => {
			// 	if (status === 401 || status === 403) {
			// 		return Promise.reject();
			// 	}
			// 	return Promise.resolve();
			// },
			// called when the user navigates to a new location, to check if the user is authenticated.
			// attempts a silent authentication to try and establish a session (if one exists).
			checkAuth: () => {
				return this.oktaAuth
					.isAuthenticated()
					.then((isAuthenticated) => {
						console.log('isAuthenticated:', isAuthenticated);

						if (isAuthenticated) {
							return Promise.resolve();
						}
						return this.oktaAuth.token
							.getWithoutPrompt()
							.then(({ tokens }) => {
								if (tokens) {
									this.oktaAuth.tokenManager.setTokens(
										tokens
									);

									return this.oktaAuth.authStateManager
										.updateAuthState()
										.then(() => Promise.resolve());
								}

								return Promise.reject();
							})
							.catch(() => Promise.reject({ message: false }));
					});
			},
			// called when the user navigates to a new location, to check for permissions / roles
			getPermissions: () => {
				let appPermissions: string[] = [];

				return this.oktaAuth
					.isAuthenticated()
					.then((isAuthenticated) => {
						if (!isAuthenticated) {
							return Promise.reject();
						}

						return this.oktaAuth.tokenManager
							.getTokens()
							.then((tokens: Tokens) => {
								const standardScopes = [
									'openid',
									'profile',
									'email',
									'phone',
									'address',
									'offline_access',
								];

								if (tokens?.accessToken) {
									const { scopes = [], permissions = [] } =
										tokens.accessToken.claims as UserClaims;

									const _permissions = Array.from(
										new Set([...scopes, ...permissions])
									);

									appPermissions = _permissions.filter(
										(permission) =>
											!standardScopes.includes(permission)
									);
								}
								// console.log(appPermissions);
								return Promise.resolve(appPermissions);
							});
					});
			},
			getIdentity: () =>
				this.getIdentity().then((result) =>
					result
						? Promise.resolve(result as UserIdentity)
						: Promise.reject()
				),
			getAccessToken: (decode: boolean = false) => {
				let result: string | OktaAccessToken | undefined;

				if (decode) {
					getTokens(this.oktaAuth).then(
						({ accessToken }) => (result = accessToken)
					);
				} else {
					result = this.oktaAuth.getAccessToken();
				}

				if (!result) {
					Promise.reject();
				}

				return Promise.resolve(result);
			},
		} as RaAuthProvider;
	}

	async getIdentity() {
		const isAuthenticated = await this.oktaAuth.isAuthenticated();

		if (!isAuthenticated) {
			return false;
		}

		const {
			sub: id,
			email,
			picture,
			...userInfo
		} = await this.oktaAuth.getUser();

		let avatar = picture;

		if (!avatar) {
			try {
				const { default: md5 } = await import('blueimp-md5');

				const hashedEmail = md5(email!.trim());

				avatar = `https://www.gravatar.com/avatar/${hashedEmail}?d=identicon`;
			} catch {}
		}

		return {
			...userInfo,
			id,
			avatar,
			email,
		};
	}
}
