const {
	VITE_APP_OKTA_TESTING_DISABLEHTTPSCHECK: DISABLEHTTPSCHECK = false,
	VITE_APP_OKTA_SCOPES: SCOPES,
	VITE_APP_OKTA_CLIENT_ID: clientId,
	VITE_APP_OKTA_AUTH_SERVER_ID: AUTH_SERVER_ID,
	VITE_APP_OKTA_URL: OKTA_URL,
	VITE_APP_OKTA_REDIRECT_URI:
		REDIRECT_URI = `${window.location.origin}/login`,
	VITE_APP_OKTA_TOKEN_MANAGER_AUTO_RENEW: TOKEN_MANAGER_AUTO_RENEW = true,
	VITE_APP_OKTA_SERVICES_AUTO_RENEW: SERVICES_AUTO_RENEW = false,
	PROD: isProd,
} = import.meta.env;

const issuer = `${OKTA_URL}/oauth2/${AUTH_SERVER_ID}`;

console.log('REDIRECT_URI');
console.log(REDIRECT_URI);
// eslint-disable-next-line
export const authConfig = {
	oidc: {
		clientId,
		issuer,
		redirectUri: REDIRECT_URI,
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
