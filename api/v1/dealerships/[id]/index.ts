import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as _ from 'lodash';
import { doAuthZ, OktaClient } from '../../../_common';

const getDealership = async (req: VercelRequest, res: VercelResponse) => {
	// 1) Validate the accessToken
	const accessToken = await doAuthZ(req, res, ['dealers:read']);

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
	} catch (error) {
		return res.status(error?.statusCode ?? 500).json({
			name: error?.code || error?.name,
			message: error?.message?.toString(),
		} as Error);
	}
};
