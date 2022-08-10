import { GroupProfile, UserProfile, User } from '@okta/okta-sdk-nodejs';

declare module '@okta/okta-sdk-nodejs' {
	interface GroupProfile {
		domain?: string;
		name?: string;
		logo?: string;
		isDeleted?: boolean;
		dealerCode?: string;
		oktaId?: string;
		roleName?: string;
		[key: string]: any;
	}

	interface UserProfile {
		profilePicture?: string;
		roles?: string[];
		dealership?: string;
		dealerships?: string[];
	}

	interface ClientConfig {
		orgUrl: string;
		token?: string;
		clientId: string;
		scopes: string[];
		authorizationMode?: string;
		privateKey: string | Record<string, unknown>;
		keyId?: string;
		cacheStore?: CacheStorage;
		defaultCacheMiddlewareResponseBufferSize?: number;
		userAgent?: string;
		httpsProxy?: string | unknown; // https://github.com/TooTallNate/node-agent-base/issues/56
	}

	interface User {
		_embedded?: any;
		_links?: any;
	}
}
