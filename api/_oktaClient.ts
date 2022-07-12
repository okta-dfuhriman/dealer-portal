import * as _ from 'lodash';
import {
	Client,
	User as OktaUser,
	UserProfile as OktaUserProfile,
	GroupProfile as OktaGroupProfile,
	GroupType as OktaGroupType,
} from '@okta/okta-sdk-nodejs';
import { RequestOptions } from '@okta/okta-sdk-nodejs/src/types/request-options';
import { ApiError } from './_common';
import md5 from 'blueimp-md5';
import { randomBytes } from 'crypto';
import axios from 'axios';

const {
	VITE_APP_OKTA_USER_SERVICE_SCOPES: SERVICE_SCOPES = '',
	VITE_APP_OKTA_USER_SERVICE_CLIENT_ID: CLIENT_ID,
	VITE_APP_OKTA_URL: ORG_URL,
	VITE_APP_OKTA_USER_SERVICE_KEY: KEY,
	VITE_APP_OKTA_USER_SERVICE_KEY_ID: KEY_ID,
	PROD: isProd,
} = process.env;

const SCOPES = SERVICE_SCOPES.split(' ') || [];

export interface Dealership {
	_embedded?: { [name: string]: unknown };
	_links?: { [name: string]: unknown };
	readonly created: string;
	readonly id: string;
	readonly lastMembershipUpdated: string;
	readonly lastUpdated: string;
	readonly objectClass: string[];
	profile: GroupProfile;
	readonly type: OktaGroupType;
}
export interface UserProfile extends Partial<OktaUserProfile> {
	profilePicture?: string;
}

export type GroupProfile = OktaGroupProfile & {
	rawName?: string;
	domain?: string;
	name?: string;
	logo?: string;
	[key: string]: string | undefined;
};

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

export interface GetUsersOptions {
	q?: string;
	after?: string;
	limit?: number;
	filter?: string;
	search?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface FetchParams {
	baseUrl?: string | URL;
	url?: string | URL;
	options?: RequestOptions;
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

	async fetch({ baseUrl, url, options }: FetchParams) {
		const _options: RequestOptions = {
			method: 'get',
			...options,
		};

		return await this.http.http(
			`${baseUrl ?? this.baseUrl}/${url}`,
			_options
		);
	}

	async getOktaUser(id: string) {
		try {
			const user = (await this.getUser(id)) as any;
			console.log(user);

			const profile = await this.cleanProfile(
				user.profile as OktaUserProfile
			);

			delete user._links;
			delete user.profile;

			return { ...user, profile } as User;
		} catch (error: any) {
			throw new Error(error);
		}
	}

	async getUsers(options: GetUsersOptions) {
		const users: User[] = [];

		for await (let user of this.listUsers(
			JSON.parse(JSON.stringify(options))
		) as any) {
			const profile = await this.cleanProfile(user!.profile);

			delete user._links;
			delete user.profile;

			users.push({ ...user, profile });
		}

		return users;
	}

	async getDealerships() {
		const response = await this.fetch({
			url: 'api/v1/groups?search=profile.name sw "Dealer"',
		});

		if (!response.ok) {
			const { status, json } = response.clone();
			throw new ApiError({
				statusCode: status,
				message: (await json()) || '',
			});
		}

		const body = (await response.json()) as Dealership[];

		const dealerships: Dealership[] = [];

		for (let i = 0; i < body.length; i++) {
			dealerships.push(await this.cleanDealership(body[i]));
		}

		return dealerships;
	}

	async getDealership(id: string) {
		return await this.cleanDealership(
			(await this.getGroup(id)) as unknown as Dealership
		);
	}

	async getDealerLogo(domain?: string) {
		const randomString = randomBytes(15).toString('hex');

		const clearbit = 'https://logo.clearbit.com/';

		let logo = `https://www.gravatar.com/avatar/${randomString}?d=identicon`;

		if (domain) {
			try {
				const controller = new AbortController();
				// Check to make sure a logo is actually available.
				const { status } = await axios.get(
					`https://logo.clearbit.com/${domain}`,
					{ signal: controller.signal }
				);

				if (status === 200) {
					logo = clearbit + domain;
				}
			} catch {}
		}

		return logo;
	}

	async cleanDealership(dealer: Dealership) {
		delete dealer?._embedded;
		delete dealer?._links;

		const regex = /.*(?<=_)/;

		const logo =
			dealer?.profile?.logo ||
			(await this.getDealerLogo(dealer?.profile?.domain));

		return {
			...dealer,
			profile: {
				...dealer.profile,
				rawName: dealer.profile.name,
				name: dealer.profile.name.replace(regex, ''),
				logo,
			},
		} as Dealership;
	}

	async getAvatar(email: string) {
		const hashedEmail = md5(email.trim());

		return `https://www.gravatar.com/avatar/${hashedEmail}?d=identicon`;
	}

	async cleanProfile(profile: UserProfile) {
		const result: UserProfile = {};

		let key: keyof UserProfile;

		for (key in profile) {
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
