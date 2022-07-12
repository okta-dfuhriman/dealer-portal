import * as _ from 'lodash';
import { Client } from '@okta/okta-sdk-nodejs';
import type {
	User as OktaUser,
	UserProfile as OktaUserProfile,
	GroupProfile as OktaGroupProfile,
	GroupType as OktaGroupType,
	CreateUserRequest as OktaCreateUserRequest,
	Collection,
} from '@okta/okta-sdk-nodejs';
import type { RequestOptions } from '@okta/okta-sdk-nodejs/src/types/request-options';
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

export interface CreateUserProfile extends UserProfile {
	email: string;
}

export type GroupProfile = OktaGroupProfile & {
	rawName?: string;
	domain?: string;
	name?: string;
	logo?: string;
	[key: string]: string | undefined;
};

export interface User
	extends Omit<OktaUser, '_embedded' | '_links' | 'profile'> {
	_embedded?: any;
	_links?: any;
	profile: UserProfile;
}

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

			return await this.cleanUser(user);
		} catch (error: any) {
			throw new Error(error);
		}
	}

	async getUsers(options: GetUsersOptions) {
		const users: User[] = [];

		let user: OktaUser | null;

		for await (user of this.listUsers(
			JSON.parse(JSON.stringify(options))
		)) {
			if (user) {
				users.push(await this.cleanUser(user));
			}
		}

		return users;
	}

	async createOktaUser(createUserRequest: CreateUserProfile) {
		const user = await this.createUser(
			{ profile: createUserRequest },
			{ activate: true }
		);

		if (!user) {
			throw new ApiError({
				statusCode: 500,
				message: 'Unable to create user!',
			});
		}

		return await this.cleanUser(user);
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

	async cleanUser(user: OktaUser) {
		const _user = user as User;

		delete _user?._embedded;
		delete _user?._links;

		let profile = {};

		let key: keyof UserProfile;

		for (key in _user.profile) {
			if (!_.isEmpty(_user.profile[key])) {
				profile[key] = _user.profile[key];
			}
		}

		const { displayName, firstName, lastName, profilePicture, email } =
			profile as UserProfile;

		if (!profilePicture) {
			profile['profilePicture'] = await this.getAvatar(email!);
		}

		if (!displayName && firstName && lastName) {
			profile['displayName'] = `${firstName} ${lastName}`;
		}

		return { ..._user, profile } as User;
	}
}
