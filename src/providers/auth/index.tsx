import type { AuthProvider as RaAuthProvider, UserIdentity } from 'react-admin';
import { OktaAuth } from '@okta/okta-auth-js';
import type { UserClaims, AccessToken } from '@okta/okta-auth-js';
import md5 from 'blueimp-md5';

import { authConfig } from 'config';

const silentAuth = async (
	sdk: OktaAuth,
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

const getTokens = async (sdk: OktaAuth) => await sdk.tokenManager.getTokens();

const oktaAuth = new OktaAuth(authConfig.oidc);

oktaAuth.start();

const AuthProvider = {
	// called when the user attempts to log in
	login: () => {
		if (oktaAuth.isLoginRedirect()) {
			console.info('Handling login redirect!');
			oktaAuth.setOriginalUri(window.location.origin);

			return oktaAuth.handleLoginRedirect();
		}
		console.info('Handling sign in w/ redirect!');
		return oktaAuth.signInWithRedirect();
	},
	// called when the user clicks on the logout button
	// logout: () => {
	// 	console.log('logout');
	// 	return Promise.resolve();
	// },
	logout: () => {
		return oktaAuth.isAuthenticated().then((isAuthenticated) => {
			if (isAuthenticated) {
				return oktaAuth.signOut();
			}
			return Promise.resolve();
		});
	},
	// called when the API returns an error
	checkError: ({ status }: { message: string; status: number }) => {
		if (status === 401 || status === 403) {
			return Promise.reject();
		}
		return Promise.resolve();
	},
	// called when the user navigates to a new location, to check if the user is authenticated.
	// attempts a silent authentication to try and establish a session (if one exists).
	checkAuth: () => {
		return oktaAuth.isAuthenticated().then((isAuthenticated) => {
			console.log('isAuthenticated:', isAuthenticated);

			if (isAuthenticated) {
				return Promise.resolve();
			}
			return oktaAuth.token
				.getWithoutPrompt()
				.then(({ tokens }) => {
					if (tokens) {
						oktaAuth.tokenManager.setTokens(tokens);

						return oktaAuth.authStateManager
							.updateAuthState()
							.then(() => Promise.resolve());
					}

					return Promise.reject();
				})
				.catch(() => Promise.reject({ message: false }));
		});
	},
	// called when the user navigates to a new location, to check for permissions / roles
	getPermissions: () => Promise.resolve(),
	getIdentity: () => {
		return oktaAuth.isAuthenticated().then((isAuthenticated) => {
			if (!isAuthenticated) {
				return Promise.reject();
			}

			return oktaAuth
				.getUser()
				.then((userInfo: UserClaims) => {
					const { sub: id, email, picture } = userInfo;

					let avatar = picture;

					if (!avatar) {
						try {
							const hashedEmail = md5(email!.trim());

							avatar = `https://www.gravatar.com/avatar/${hashedEmail}?d=identicon`;
						} catch {}
					}

					return {
						...userInfo,
						id,
						avatar,
					} as UserIdentity;
				})
				.then((user) => Promise.resolve(user))
				.catch(() => Promise.reject());
		});
	},
	getAccessToken: (decode: boolean = false) => {
		let result: string | AccessToken | undefined;

		if (decode) {
			getTokens(oktaAuth).then(
				({ accessToken }) => (result = accessToken)
			);
		} else {
			result = oktaAuth.getAccessToken();
		}

		if (!result) {
			Promise.reject();
		}

		return Promise.resolve(result);
	},
} as RaAuthProvider;

export default AuthProvider;
