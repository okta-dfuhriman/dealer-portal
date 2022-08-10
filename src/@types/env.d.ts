/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_OKTA_CLIENT_ID: string;
	readonly VITE_APP_OKTA_URL: string;
	readonly VITE_APP_OKTA_AUTH_SERVER_ID: string;
	readonly VITE_APP_OKTA_SCOPES: string;
	readonly VITE_APP_OKTA_TESTING_DISABLEHTTPSCHECK: boolean;
}
