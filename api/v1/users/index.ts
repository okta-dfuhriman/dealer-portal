import type { VercelRequest, VercelResponse } from '@vercel/node';
import { doAuthZ, OktaClient, GetUsersOptions } from '../../_common';

const getUsers = async (req: VercelRequest, res: VercelResponse) => {
	try {
		// 1) Validate the accessToken
		const accessToken = await doAuthZ(req, res, ['user:read']);

		const client = new OktaClient();

		if (!accessToken) {
			return res.status(401).send('Unauthorized');
		}

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
	} catch (error) {
		throw new Error(`getUsers(): ${error}`);
	}
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const { method } = req;

		switch (method) {
			case 'GET':
			case 'HEAD':
				return await getUsers(req, res);
			case 'POST':
			default:
				return res.status(501).send('');
		}
	} catch (error) {
		return res
			.status(error?.statusCode ?? 500)
			.json({ code: error?.code, message: error?.message.toString() });
	}
};
