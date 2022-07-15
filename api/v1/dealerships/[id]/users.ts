import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as _ from 'lodash';
import { JwtValidator, OktaClient, ApiError } from '../../../_common';
import type { ValidateResult } from '../../../_common';

const getDealershipRoleUsers = async (
	req: VercelRequest,
	res: VercelResponse
) => {
	const {
		query: { id },
	} = req;

	// Parse the JWT
	const { isValid, accessToken } = (await new JwtValidator(
		req,
		{ assertions: { permissions: ['roles:read'] } },
		res
	).validateTokens()) as ValidateResult;

	if (!isValid || !accessToken) {
		return res.status(401).send('Unauthorized');
	}

	const client = new OktaClient();

	const data = await client.getDealershipRoleUsers(id?.toString());

	return res.json({ data, total: data.length });
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const { method } = req;

		switch (method) {
			case 'GET':
			case 'HEAD':
				return await getDealershipRoleUsers(req, res);
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
