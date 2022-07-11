const {
	VITE_APP_OKTA_TESTING_DISABLEHTTPSCHECK: DISABLEHTTPSCHECK = false,
	VITE_APP_OKTA_SCOPES: SCOPES,
	VITE_APP_OKTA_CLIENT_ID: CLIENT_ID,
	VITE_APP_OKTA_AUTH_SERVER_ID: AUTH_SERVER_ID,
	VITE_APP_OKTA_URL: OKTA_URL,
	VITE_APP_OKTA_REDIRECT_URI: REDIRECT_URI,
	PROD: isProd,
} = import.meta.env;

const ISSUER = `${OKTA_URL}/oauth2/${AUTH_SERVER_ID}`;

// eslint-disable-next-line
export const authConfig = {
	oidc: {
		clientId: CLIENT_ID,
		issuer: ISSUER,
		redirectUri: REDIRECT_URI || `${window.location.origin}/login`,
		scopes: SCOPES?.split(' '),
		pkce: true,
		tokenManager: {
			autoRenew: true,
		},
		services: {
			autoRenew: true,
		},
		devMode: !isProd,
		disableHttpsCheck: DISABLEHTTPSCHECK,
	},
};
