const {
	VITE_APP_OKTA_TESTING_DISABLEHTTPSCHECK: DISABLEHTTPSCHECK = false,
	VITE_APP_OKTA_SCOPES: SCOPES,
	VITE_APP_OKTA_CLIENT_ID: CLIENT_ID,
	VITE_APP_OKTA_AUTH_SERVER_ID: AUTH_SERVER_ID,
	VITE_APP_OKTA_URL: OKTA_URL,
	VITE_APP_OKTA_REDIRECT_URI: REDIRECT_URI,
	VITE_APP_OKTA_TOKEN_MANAGER_AUTO_RENEW: TOKEN_MANAGER_AUTO_RENEW = true,
	VITE_APP_OKTA_SERVICES_AUTO_RENEW: SERVICES_AUTO_RENEW = false,
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
			autoRenew: TOKEN_MANAGER_AUTO_RENEW,
		},
		services: {
			autoRenew: SERVICES_AUTO_RENEW,
		},
		devMode: !isProd,
		disableHttpsCheck: DISABLEHTTPSCHECK,
	},
};
