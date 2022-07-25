import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { JwtClaims as Claims } from '@okta/jwt-verifier';
import type { UserProfile } from '@okta/okta-sdk-nodejs';
import { OktaClient } from '../_common';
import * as _ from 'lodash';

// const _roles = {
// 	org_admin: ['org:admin:all'],
// 	dealer_admin: [
// 		'users:read:self',
// 		'users:update:self',
// 		'users:read',
// 		'users:update',
// 		'users:deactivate',
// 		'dealerships:read',
// 		'dealerships:create',
// 		'dealerships:read:self',
// 		'dealerships:deactivate',
// 	],
// 	user: ['users:read:self', 'users:update:self'],
// };

const { HOOK_API_KEY, PERMISSIONS_MAP } = process.env;

const permissionsMap: PermissionsMap =
	typeof PERMISSIONS_MAP === 'string'
		? JSON.parse(PERMISSIONS_MAP)
		: PERMISSIONS_MAP || {};

interface PermissionsMap {
	orgAdmin: string[];
	dealerAdmin: string[];
	partsUser: string[];
	salesUser: string[];
	user: string[];
}

interface TypeTokenRequest {
	lifetime?: { expiration: number };
}

type Scope = {
	id: string;
	action: string;
};

interface TypeTokenScopes {
	openid: Scope;
	profile: Scope;
	email: Scope;
	address: Scope;
	phone: Scope;
	offline_access: Scope;
	groups: Scope;
	device_sso: Scope;
	[key: string]: Scope;
}

interface HookRequest {
	source: string;
	eventId: string;
	eventTime: string;
	data: {
		context: {
			protocol?: {
				request: {
					scope: string;
					state: string;
					redirect_uri: string;
					response_mode: string;
					response_type: string;
					client_id: string;
				};
				issuer: {
					uri: string;
				};
				client: {
					id: string;
					name: string;
					type: string;
				};
			};
			user?: {
				id: string;
				[key: string]: any;
			};
			[key: string]: any;
		};
		identity?: {
			claims: Claims;
			token: TypeTokenRequest;
		};
		access?: {
			claims: Claims;
			token: TypeTokenRequest;
			scopes: Partial<TypeTokenScopes>;
		};
	};
	[key: string]: any;
}

module.exports = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const {
			headers: { authorization },
			body,
		} = req || {};

		const {
			scopes,
			claims: { uid },
		}: { scopes: Scope[]; claims: Claims } = body?.data
			?.access as HookRequest['access'];

		if (!authorization || authorization !== HOOK_API_KEY) {
			console.error('Unauthorized');
			return res.status(401).send('Unauthorized');
		}

		// Reduce scopes
		const _scp: string[] = [
			...permissionsMap['user' as keyof PermissionsMap],
		];

		if (scopes) {
			for (const [key, value] of Object.entries(scopes)) {
				_scp.push(key);
			}
		}

		let scp: string[] = _scp;

		// Fetch user
		const client = new OktaClient();

		if (uid) {
			const user = await client.getOktaUser(uid as string);

			if (user) {
				const roles = user?.profile?.roles as UserProfile['roles'];

				roles?.forEach((role) => {
					if (role === ('org_admin' as keyof PermissionsMap)) {
						_scp.push(
							...(permissionsMap[
								'dealer_admin' as keyof PermissionsMap
							] as string[])
						);
					}

					_scp.push(
						...(permissionsMap[
							role as keyof PermissionsMap
						] as string[])
					);
				});

				// De-dupe scopes
				scp = Array.from(new Set(_scp));
			}
		}

		const tokenResponse = {
			commands: [
				{
					type: 'com.okta.access.patch',
					value: [
						{
							op: 'replace',
							path: '/claims/scp',
							value: scp,
						},
					],
				},
			],
		};

		console.log(JSON.stringify(tokenResponse, null, 2));
		return res.json(tokenResponse);
	} catch (error: any) {
		console.error(error);
		return res.status(500).send(error);
	}
};
