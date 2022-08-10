/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_REACT_QUERY_STALE_TIME?: number;
	readonly VITE_APP_OKTA_TESTING_DISABLEHTTPSCHECK?: boolean;
	readonly VITE_APP_OKTA_SCOPES?: string;
	readonly VITE_APP_OKTA_CLIENT_ID: string;
	readonly VITE_APP_OKTA_AUTH_SERVER_ID: string;
	readonly VITE_APP_OKTA_URL: string;
	readonly VITE_APP_OKTA_REDIRECT_URI?: string;
	readonly VITE_APP_OKTA_TOKEN_MANAGER_AUTO_RENEW?: boolean;
	readonly VITE_APP_OKTA_SERVICES_AUTO_RENEW?: boolean;
	readonly PROD?: boolean;
}
