import * as _ from 'lodash';
import {
	Client,
	User as OktaUser,
	UserProfile as OktaUserProfile,
} from '@okta/okta-sdk-nodejs';
import { ApiError } from './_common';
import md5 from 'blueimp-md5';

const {
	VITE_APP_OKTA_USER_SERVICE_SCOPES: SERVICE_SCOPES = '',
	VITE_APP_OKTA_CLIENT_ID: CLIENT_ID,
	VITE_APP_OKTA_URL: ORG_URL,
	VITE_APP_OKTA_USER_SERVICE_KEY: KEY,
	PROD: isProd,
} = process.env;

const SCOPES = SERVICE_SCOPES.split(' ') || [];

export interface UserProfile extends Partial<OktaUserProfile> {
	profilePicture?: string;
}

export interface User extends Omit<OktaUser, '_embedded' | '_links'> {}

export interface OktaConfig {
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

export interface TypeOktaClient extends Omit<Client, 'getUser'> {
	getUser: (id: string) => Promise<User>;
}

export default class OktaClient extends Client {
	constructor(config?: OktaConfig) {
		const _defaultConfig = {
			orgUrl: ORG_URL,
			authorizationMode: 'PrivateKey',
			clientId: CLIENT_ID as string,
			scopes: SCOPES,
			privateKey: KEY as string,
		};
		super({ ..._defaultConfig, ...config } as any);
	}

	async fetch({ baseUrl, url, options }) {
		// TODO swap SSWS out for Okta-4-OAuth
		const _options = {
			method: 'get',
			...options,
		};

		return await this.http.http(
			`${baseUrl ?? this.baseUrl}/${url}`,
			_options
		);
	}

	async getOktaUser(id: string) {
		const user = (await this.getUser(id)) as any;

		const profile = await this.cleanProfile(
			user.profile as OktaUserProfile
		);

		delete user._links;
		delete user.profile;

		return { ...user, profile } as User;
	}

	async getAvatar(email: string) {
		const hashedEmail = md5(email.trim());

		return `https://www.gravatar.com/avatar/${hashedEmail}?d=identicon`;
	}

	async cleanProfile(profile: OktaUserProfile) {
		const result: UserProfile = {};

		for (const key in profile) {
			if (!_.isEmpty(profile[key])) {
				result[key] = profile[key];
			}
		}

		const {
			displayName: name,
			firstName,
			lastName,
			profilePicture: picture,
			email,
		} = result;

		result.profilePicture = picture || (await this.getAvatar(email!));

		if (!name && firstName && lastName) {
			result.displayName = `${firstName} ${lastName}`;
		}

		return result;
	}
}
