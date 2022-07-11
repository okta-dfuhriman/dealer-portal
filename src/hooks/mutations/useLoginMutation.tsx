// const GOOGLE_IDP_ID = '0oa3cdpdvdd3BHqDA1d7';
// const LINKEDIN_IDP_ID = '0oa3cdljzgEyGBMez1d7';
// const APPLE_IDP_ID = '';
// const FACEBOOK_IDP_ID = '0oa3cdkzv0cGPFifd1d7';
// const SALESFORCE_IDP_ID = '0oa3cdq1662ouS1uG1d7';

import { OktaAuth } from '@okta/okta-auth-js';
import { useMutation } from 'react-query';

// const idpMap = {
// 	google: GOOGLE_IDP_ID,
// 	linkedin: LINKEDIN_IDP_ID,
// 	apple: APPLE_IDP_ID,
// 	facebook: FACEBOOK_IDP_ID,
// 	salesforce: SALESFORCE_IDP_ID,
// 	[GOOGLE_IDP_ID]: 'google',
// 	[LINKEDIN_IDP_ID]: 'linkedin',
// 	[FACEBOOK_IDP_ID]: 'facebook',
// 	[SALESFORCE_IDP_ID]: 'salesforce',
// };

const silentAuthFn = async (oktaAuth: OktaAuth, _hasSession?: boolean) => {
	let isAuthenticated: boolean | undefined;
	let authState = oktaAuth.authStateManager.getAuthState();

	// If are not sure if the user is already authenticated, double check.
	if (isAuthenticated === undefined) {
		// Checks if we can get tokens using either a refresh_token or, if our tokens are expired, if getWithoutPrompt works.
		isAuthenticated = await oktaAuth.isAuthenticated();
	}

	if (!isAuthenticated) {
		const hasSession = _hasSession || (await oktaAuth.session.exists());

		if (hasSession) {
			// Have a session but no tokens in tokenManager.
			// ** Hail Mary attempt to authenticate via existing session. **

			const { tokens } = await oktaAuth.token.getWithoutPrompt();

			if (tokens) {
				await oktaAuth.tokenManager.setTokens(tokens);

				authState = await oktaAuth.authStateManager.updateAuthState();
			}
		}
	}

	return isAuthenticated;
};

const loginFn = async (oktaAuth: OktaAuth) => {
	const authState = oktaAuth.authStateManager.getAuthState();

	if (oktaAuth.isLoginRedirect()) {
		await oktaAuth.handleLoginRedirect();
	}

	if (!authState?.isAuthenticated) {
		const hasSession = await oktaAuth.session.exists();

		if (!hasSession) {
			return oktaAuth.signInWithRedirect();
		}

		return await silentAuthFn(oktaAuth, hasSession);
	}
};

const useLoginMutation = (oktaAuth: OktaAuth) => {
	try {
		return useMutation(() => loginFn(oktaAuth), {
			mutationKey: ['login'],
		});
	} catch (error) {
		throw new Error('userLoginMutation init error!');
	}
};

export const silentAuth = silentAuthFn;

export default useLoginMutation;
