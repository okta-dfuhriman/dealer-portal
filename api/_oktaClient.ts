import _ from 'lodash';
import { Client, CreateUserRequest, GroupRule } from '@okta/okta-sdk-nodejs';
import type {
	User,
	UserProfile,
	GroupProfile,
	GroupRuleOptions,
	Group as OktaGroup,
	ClientConfig,
	UserOptions,
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

export interface Dealership
	extends Omit<Partial<OktaGroup>, '_embedded' | '_links' | 'profile'> {
	_embedded?: { [name: string]: unknown };
	_links?: { [name: string]: unknown };
	profile: GroupProfile;
}
export interface Role extends Dealership {}

export interface CreateDealerRequest {
	name?: string;
	description?: string;
	domain?: string;
	dealerCode: string;
}

export interface CreateRoleRequest
	extends Omit<CreateDealerRequest, 'domain' | 'dealerCode'> {
	roleName: string;
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
	constructor(config?: ClientConfig) {
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

			return await this.parseUser(user);
		} catch (error: any) {
			throw new Error(error);
		}
	}

	async getUsers(options: GetUsersOptions) {
		const users: User[] = [];

		let user: User | null;

		for await (user of this.listUsers(
			JSON.parse(JSON.stringify(options))
		)) {
			if (user) {
				users.push(await this.parseUser(user));
			}
		}

		return users;
	}

	async createOktaUser({ profile }: CreateUserRequest) {
		if (!profile.login) {
			profile['login'] = profile.email;
		}

		const user = await this.createUser({ profile }, { activate: true });

		if (!user) {
			throw new ApiError({
				statusCode: 500,
				message: 'Unable to create user!',
			});
		}

		return await this.parseUser(user);
	}

	async updateOktaUser({ id, ...data }: User) {
		let oktaUser = await this.getUser(id!);

		if (!oktaUser) {
			throw new ApiError({
				statusCode: 500,
				message: 'Unable to update user!',
			});
		}

		const profile = {
			...oktaUser.profile,
			...(data.profile as UserProfile),
		};

		oktaUser.profile = profile;

		oktaUser = await oktaUser.update();

		return await this.parseUser(oktaUser);
	}

	async getDealershipUsers(id: string) {
		const users: User[] = [];

		let user: User | null;

		for await (user of this.listGroupUsers(id)) {
			if (user) {
				users.push(await this.parseUser(user));
			}
		}

		return users;
	}

	async getDealerships() {
		const searchQuery = 'q=dealership';
		const response = await this.fetch({
			url: 'api/v1/groups?' + searchQuery,
		});

		if (!response.ok) {
			const { status, json } = response.clone();
			throw new ApiError({
				statusCode: status,
				message: (await json()) || '',
			});
		}

		const body = (await response.json()) as OktaGroup[];

		const dealerships: Dealership[] = [];

		for (let i = 0; i < body.length; i++) {
			const dealership = await this.parseDealership(body[i]);

			if (dealership) {
				dealerships.push(dealership);
			}
		}

		return dealerships;
	}

	async getDealership(id: string) {
		return await this.parseDealership(await this.getGroup(id));
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

	async createDealership(data: CreateDealerRequest) {
		data.name = `dealership|${data.dealerCode}`;

		// 1) Create the group and parse the response.
		const oktaGroup = await this.createGroup({
			profile: { ...data },
		});

		const group = await this.parseDealership(oktaGroup);

		// 2) Generate the options
		const ruleOptions = {
			name: group?.profile.name,
			type: 'group_rule',
			conditions: {
				expression: {
					type: 'urn:okta:expression:1.0',
					value: `user.dealership==\"${oktaGroup.profile?.dealerCode}\"`,
				},
			},
			actions: {
				assignUserToGroups: {
					groupIds: [oktaGroup.id],
				},
			},
		} as GroupRuleOptions;

		// 3) Create the group rule
		const rule = await this.createGroupRule(ruleOptions);

		// 4) Activate the group rule
		if (rule?.id) {
			await this.activateGroupRule(rule.id);
		}

		return group;
	}

	async updateDealership({ id, ...data }: OktaGroup) {
		let oktaGroup = await this.getGroup(id);

		oktaGroup.profile = {
			...oktaGroup.profile,
			...data.profile,
		};

		oktaGroup = await oktaGroup.update();

		return await this.parseDealership(oktaGroup);
	}

	async parseDealership(oktaGroup: OktaGroup) {
		const oktaId = oktaGroup.id;

		let updatedProfile: Partial<GroupProfile> = {};

		if (!oktaGroup?.profile?.oktaId) {
			updatedProfile['oktaId'] = oktaId;
		}

		if (oktaGroup?.profile?.isDeleted) {
			return;
		}

		// If group name has not been properly set. Do it now.
		// This typically happens during a create flow, but could happen other ways.
		if (oktaGroup?.profile?.name.split('_')[0] !== 'dealership') {
			updatedProfile.name = `dealership|${oktaGroup?.profile?.dealerCode}`;
		}

		if (Object.keys(updatedProfile).length > 0) {
			oktaGroup.profile = {
				...oktaGroup.profile,
				...updatedProfile,
			};

			oktaGroup = await oktaGroup.update();
		}

		const dealer = oktaGroup as Dealership;

		delete dealer?._embedded;
		delete dealer?._links;

		const logo = await this.getDealerLogo(dealer.profile?.domain);

		return {
			...dealer,
			profile: {
				...dealer.profile,
				logo,
			},
		} as Dealership;
	}

	async deactivateDealership(id: string, shouldDelete: boolean = false) {
		try {
			// 1) Fetch the group
			let group = await this.getGroup(id);

			const {
				profile: { name },
			} = group;

			// 2) Fetch associated rule
			let groupRule = await this.getOktaGroupRule(group);

			// 3) Deactivate the rule
			const deactivateRsp = await groupRule.deactivate();
			console.log('\ndeactivateRsp');
			console.log(deactivateRsp);

			// 4) If 'shouldDelete', delete rule and group
			if (shouldDelete) {
				await group.delete();
				await groupRule.delete();
			} else {
				// Otherwise, update names to 'DELETED'
				groupRule.name = `DELETED|${groupRule.name}`;
				groupRule = await groupRule.update();

				group.profile.name = `DELETED|${name}`;
				group.profile.isDeleted = true;
				group = await group.update();
			}

			return true;
		} catch (error: any) {
			console.error(error);
			return error;
		}
	}

	async getOktaGroupRule(group: OktaGroup) {
		const {
			id: groupId,
			profile: { name: groupName },
		} = group;
		return this.listGroupRules({ search: groupName })
			.each((_groupRule) => {
				const groupIds =
					_groupRule?.actions?.assignUserToGroups?.groupIds;

				if (groupIds.length === 1 && groupIds.includes(groupId)) {
					return _groupRule;
				} else {
					throw new Error('Unable to find an associated group rule!');
				}
			})
			.then((groupRule) => Promise.resolve(groupRule as GroupRule));
	}

	async getAvatar(email: string) {
		const hashedEmail = md5(email.trim());

		return `https://www.gravatar.com/avatar/${hashedEmail}?d=identicon`;
	}

	async parseUser(user: User) {
		const _user = user as any;

		delete _user?._embedded;
		delete _user?._links;

		const profile = _user?.profile as Partial<UserProfile>;

		Object.keys(profile).forEach((key) => {
			let _key = key as keyof UserProfile;

			if (typeof profile[_key] === undefined) {
				delete profile[_key];
			}
		});

		const { displayName, firstName, lastName, profilePicture, email } =
			profile;

		if (!profile?.profilePicture) {
			profile.profilePicture = await this.getAvatar(email!);
		}

		if (!displayName && firstName && lastName) {
			profile.displayName = `${firstName} ${lastName}`;
		}

		return { ..._user, profile } as User;
	}

	async getDealershipRole(id: string) {
		return await this.parseDealershipRole(await this.getGroup(id));
	}

	async getDealershipRoles() {
		const searchQuery = 'q=role';
		const response = await this.fetch({
			url: 'api/v1/groups?' + searchQuery,
		});

		if (!response.ok) {
			const { status, json } = response.clone();
			throw new ApiError({
				statusCode: status,
				message: (await json()) || '',
			});
		}

		const body = (await response.json()) as OktaGroup[];

		const roles: Role[] = [];

		for (let i = 0; i < body.length; i++) {
			const role = await this.parseDealershipRole(body[i]);

			if (role) {
				roles.push(role);
			}
		}

		return roles;
	}

	async createDealershipRole(data: CreateRoleRequest) {
		data.name = `role|${data.roleName}`;

		// 1) Create the group and parse the response.
		const oktaGroup = await this.createGroup({
			profile: { ...data },
		});

		const group = await this.parseDealershipRole(oktaGroup);

		// 2) Generate the options
		const ruleOptions = {
			name: group?.profile.name,
			type: 'group_rule',
			conditions: {
				expression: {
					type: 'urn:okta:expression:1.0',
					value: `user.dealership==\"${oktaGroup.profile?.roleName}\"`,
				},
			},
			actions: {
				assignUserToGroups: {
					groupIds: [oktaGroup.id],
				},
			},
		} as GroupRuleOptions;

		// 3) Create the group rule
		const rule = await this.createGroupRule(ruleOptions);

		// 4) Activate the group rule
		if (rule?.id) {
			await this.activateGroupRule(rule.id);
		}

		return group;
	}

	async updateDealershipRole({ id, ...data }: OktaGroup) {
		let oktaGroup = await this.getGroup(id);

		oktaGroup.profile = {
			...oktaGroup.profile,
			...data.profile,
		};

		oktaGroup = await oktaGroup.update();

		return await this.parseDealershipRole(oktaGroup);
	}

	async getDealershipRoleUsers(id: string) {
		const users: User[] = [];

		let user: User | null;

		for await (user of this.listGroupUsers(id)) {
			if (user) {
				users.push(await this.parseUser(user));
			}
		}

		return users;
	}

	async parseDealershipRole(oktaGroup: OktaGroup) {
		const oktaId = oktaGroup.id;

		let updatedProfile: Partial<GroupProfile> = {};

		if (!oktaGroup?.profile?.oktaId) {
			updatedProfile['oktaId'] = oktaId;
		}

		if (oktaGroup?.profile?.isDeleted) {
			return;
		}

		// If group name has not been properly set. Do it now.
		// This typically happens during a create flow, but could happen other ways.
		if (oktaGroup?.profile?.name.split('_')[0] !== 'role') {
			updatedProfile.name = `role|${oktaGroup?.profile?.roleName}`;
		}

		if (Object.keys(updatedProfile).length > 0) {
			oktaGroup.profile = {
				...oktaGroup.profile,
				...updatedProfile,
			};

			oktaGroup = await oktaGroup.update();
		}

		const role = oktaGroup as Role;

		delete role?._embedded;
		delete role?._links;

		return role;
	}
}
