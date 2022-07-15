import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as _ from 'lodash';
import { JwtValidator, OktaClient, ApiError } from '../../../_common';
import type { ValidateResult } from '../../../_common';

const getDealershipUsers = async (req: VercelRequest, res: VercelResponse) => {
	const {
		query: { id },
	} = req;

	// Parse the JWT
	const validator = new JwtValidator(
		req,
		{ assertions: { permissions: ['users:read'] } },
		res
	);

	let result = (await validator.validateTokens()) as ValidateResult;

	if (
		!result?.isValid &&
		id &&
		result?.accessToken?.claims?.dealership === id
	) {
		result = (await validator.validateTokens(
			{ permissions: ['users:read:dealership'] },
			false
		)) as ValidateResult;
	}

	if (!result?.isValid || !result?.accessToken) {
		return res.status(401).send('Unauthorized');
	}

	const client = new OktaClient();

	const data = await client.getDealershipUsers(id?.toString());

	return res.json({ data, total: data.length });
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const { method } = req;

		switch (method) {
			case 'GET':
			case 'HEAD':
				return await getDealershipUsers(req, res);
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
