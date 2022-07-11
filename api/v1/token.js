import * as okta from '@okta/okta-sdk-nodejs';
import * as _ from 'lodash';

const HOOK_API_KEY = process.env.HOOK_API_KEY;
const API_KEY = process.env.API_KEY;
const ORG_URL = process.env.REACT_APP_OKTA_URL;
const LINKED_OBJECT_NAME = process.env.LINKED_OBJECT_NAME;
const client = new okta.Client({ orgUrl: ORG_URL, token: API_KEY });

const claimMap = {
	firstName: 'given_name',
	middleName: 'middle_name',
	lastName: 'family_name',
	nickName: 'nickname',
	displayName: 'name',
	id: 'id',
	email: 'email',
	emailVerified: 'email_verified',
	profileUrl: 'profile',
	primaryPhone: 'primary_phone',
	streetAddress: 'street_address',
	city: 'locality',
	state: 'region',
	zipCode: 'postal_code',
	countryCode: 'country',
};

const claimMapper = (profile, scopes) => {
	const result = {};
	const address = {};

	for (const [key, value] of Object.entries(profile)) {
		if (!_.isEmpty(value)) {
			const claim = claimMap[key];

			switch (true) {
				case scopes.includes('address') &&
					['street_address', 'locality', 'region', 'postal_code', 'country'].includes(claim):
					address[claim] = value;
					break;
				case scopes.includes('email') && ['email', 'email_verified'].includes(claim):
				case scopes.includes('phone') && ['phone'].includes(claim):
				case scopes.includes('profile') &&
					['given_name', 'middle_name', 'family_name', 'nickname', 'name', 'profile'].includes(
						claim
					):
					result[claim] = value;
					break;
				default:
					break;
			}
		}
	}

	if (Object.keys(address).length > 0) {
		result['address'] = address;
	}

	return result;
};

module.exports = async (req, res) => {
	try {
		const {
			headers: { authorization },
			body: {
				data: {
					access: {
						scopes,
						claims: { primary_email, sub },
					},
				},
			},
		} = req || {};

		if (!authorization || authorization !== HOOK_API_KEY) {
			return res.status(401).send('Unauthorized');
		}

		const regex = /(?<=users\/).*/;

		if (primary_email) {
			const url = `api/v1/users/${sub}/linkedObjects/${LINKED_OBJECT_NAME}`;

			const options = {
				method: 'get',
				headers: {
					Authorization: `SSWS ${API_KEY}`,
				},
			};

			const response = await client.http.http(`${client.baseUrl}/${url}`, options);

			if (response.ok) {
				const body = await response.json();

				if (Array.isArray(body) && body.length === 1) {
					const {
						_links: {
							self: { href },
						},
					} = body[0];

					const path = new URL(href).pathname;

					const primaryUser = regex.exec(path)[0] || undefined;

					if (primaryUser) {
						const { id, profile } = await client.getUser(primaryUser);

						const primaryProfile = claimMapper(profile, Object.keys(scopes));

						primaryProfile['id'] = id;

						const tokenResponse = {
							commands: [
								{
									type: 'com.okta.identity.patch',
									value: [
										{
											op: 'add',
											path: '/claims/primary_profile',
											value: primaryProfile,
										},
									],
								},
							],
						};

						return res.json(tokenResponse);
					}
				}
			}
		}

		return res.status(204).send();
	} catch (error) {
		return res.status(500).send(error);
	}
};
