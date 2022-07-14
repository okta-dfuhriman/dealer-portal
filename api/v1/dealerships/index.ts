import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as _ from 'lodash';
import { doAuthZ, OktaClient } from '../../_common';
import type { CreateDealerRequest } from '../../_common';

const getDealerships = async (req: VercelRequest, res: VercelResponse) => {
	// 1) Validate the accessToken
	const accessToken = await doAuthZ(req, res, ['dealerships:read']);

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

const createDealership = async (req: VercelRequest, res: VercelResponse) => {
	// 1) Validate the accessToken
	const accessToken = await doAuthZ(req, res, ['dealerships:create']);

	const client = new OktaClient();

	if (!accessToken) {
		return res.status(401).send('Unauthorized');
	}

	const { body } = req;

	// 2) Create the dealership
	const data = await client.createDealership(body as CreateDealerRequest);

	return res.json({ data });
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const { method } = req;

		switch (method) {
			case 'GET':
			case 'HEAD':
				return await getDealerships(req, res);
			case 'POST':
				return await createDealership(req, res);
			default:
				return res.status(501).send('Not implemented');
		}
	} catch (error: any) {
		return res
			.status(
				typeof error?.statusCode === 'string'
					? parseInt(error.statusCode)
					: error.statusCode || 500
			)
			.json(error);
	}
};
