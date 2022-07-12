import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as _ from 'lodash';
import { doAuthZ, OktaClient } from '../../_common';

const getDealerships = async (req: VercelRequest, res: VercelResponse) => {
	// 1) Validate the accessToken
	const accessToken = await doAuthZ(req, res, ['dealers:read']);

	const client = new OktaClient();

	if (!accessToken) {
		return res.status(401).send('Unauthorized');
	}

	const {
		query: { q, filter, search, limit, after, sortBy, sortOrder = 'ASC' },
	} = req || {};

	const _sortOrder = sortOrder?.toString()?.toLowerCase();

	if (_sortOrder && !['asc', 'desc'].includes(_sortOrder)) {
		return res
			.status(400)
			.send(
				'Malformed request! `sortOrder` must be one of `asc` or `desc`'
			);
	}

	const data = await client.getDealerships();

	let result = {
		total: data.length,
		data,
	};

	if (_sortOrder === 'desc') {
		result.data = _.orderBy(data, ['profile.name'], ['desc']);
	}

	return res.json(result);
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const { method } = req;

		switch (method) {
			case 'GET':
			case 'HEAD':
				return await getDealerships(req, res);
			default:
				return res.status(501).send('Not implemented');
		}
	} catch (error) {
		return res
			.status(error?.statusCode ?? 500)
			.json({ code: error?.code, message: error?.message.toString() });
	}
};
