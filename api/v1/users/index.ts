import { OktaClient, JwtValidator } from '../../_common';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CreateUserRequest } from '@okta/okta-sdk-nodejs';
import type { GetUsersOptions, ValidateResult } from '../../_common';

const getUsers = async (req: VercelRequest, res: VercelResponse) => {
	try {
		// 1) Validate the accessToken
		const { isValid, accessToken } = (await new JwtValidator(
			req,
			{ assertions: { permissions: ['users:read'] } },
			res
		).validateTokens()) as ValidateResult;

		if (!isValid || !accessToken) {
			return res.status(401).send('Unauthorized');
		}

		const client = new OktaClient();

		const {
			query: { q, filter, search, limit, after, sortBy, sortOrder },
		} = req || {};

		const _sortOrder = sortOrder?.toString();

		if (_sortOrder && !['asc', 'desc'].includes(_sortOrder)) {
			return res
				.status(400)
				.send(
					'Malformed request! `sortOrder` must be one of `asc` or `desc`'
				);
		}

		const options: GetUsersOptions = {
			q: q?.toString(),
			filter: filter?.toString(),
			search: search?.toString(),
			limit: limit ? parseInt(limit.toString()) : undefined,
			after: after?.toString(),
			sortBy: sortBy?.toString() || 'asc',
			sortOrder: _sortOrder as GetUsersOptions['sortOrder'],
		};

		if (!options?.search && options?.sortBy) {
			options.search = `${options.sortBy} pr`;
		}

		const users = (await client.getUsers(options)) || [];

		return res.json({
			total: users.length,
			data: users,
		});
	} catch (error: any) {
		throw new Error(`getUsers(): ${error}`);
	}
};

const createUser = async (req: VercelRequest, res: VercelResponse) => {
	const body: CreateUserRequest = req?.body;

	// 1) Validate the accessToken
	const { isValid, accessToken } = (await new JwtValidator(
		req,
		{ assertions: { permissions: ['users:create'] } },
		res
	).validateTokens()) as ValidateResult;

	if (!isValid || !accessToken) {
		return res.status(401).send('Unauthorized');
	}

	const client = new OktaClient();

	const user = await client.createOktaUser(body);

	if (!user) {
		return res
			.status(500)
			.send(
				'User was not returned after creation. The user may, or may not, have actually been created.'
			);
	}

	return res.json({ data: user });
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const { method } = req;

		switch (method) {
			case 'GET':
			case 'HEAD':
				return await getUsers(req, res);
			case 'POST':
				return await createUser(req, res);
			default:
				return res.status(501).send('');
		}
	} catch (error: any) {
		if (error instanceof Error) {
			return res.status(500).json(error.toString());
		}
		return res
			.status(
				typeof error?.statusCode === 'string'
					? parseInt(error.statusCode)
					: error.statusCode || 500
			)
			.json(typeof error === 'string' ? error : error.toString());
	}
};
