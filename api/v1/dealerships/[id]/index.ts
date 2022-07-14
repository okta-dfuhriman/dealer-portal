import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as _ from 'lodash';
import { doAuthZ, OktaClient, ApiError } from '../../../_common';

const getDealership = async (req: VercelRequest, res: VercelResponse) => {
	// 1) Validate the accessToken
	const accessToken = await doAuthZ(req, res, ['dealerships:read']);

	const client = new OktaClient();

	if (!accessToken) {
		return res.status(401).send('Unauthorized');
	}

	const {
		query: { id },
	} = req || {};

	const data = await client.getDealership(id?.toString());

	return res.json({ data });
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const { method } = req;

		switch (method) {
			case 'GET':
			case 'HEAD':
				return await getDealership(req, res);
			default:
				return res.status(501).send('Not implemented');
		}
	} catch (error: any | ApiError) {
		if (error instanceof ApiError) {
			return res
				.status(
					(typeof error?.statusCode === 'string'
						? parseInt(error.statusCode)
						: error.statusCode) || 500
				)
				.json(error?.message);
		}

		return res.status(500).json(error);
	}
};
