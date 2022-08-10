import { JwtValidator, OktaClient, ApiError } from '../../../_common';

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ValidateResult } from '../../../_common';

const getDealershipRole = async (req: VercelRequest, res: VercelResponse) => {
	const {
		query: { id },
	} = req;

	console.log(id);
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

	const data = await client.getDealershipRole(id?.toString());

	return res.json({ data });
};

const updateDealershipRole = async (
	req: VercelRequest,
	res: VercelResponse
) => {
	try {
		const id = req?.query?.id as string;
		const body = req?.body;

		// 1) Validate the accessToken
		const { isValid, accessToken } = (await new JwtValidator(
			req,
			{ assertions: { permissions: ['roles:update'] } },
			res
		).validateTokens()) as ValidateResult;

		if (!isValid || !accessToken) {
			return res.status(401).send('Unauthorized');
		}

		const client = new OktaClient();

		const role = await client.updateDealershipRole(body);

		if (!role) {
			return res
				.status(500)
				.send(
					'Role was not returned after update. The role may, or may not, have actually been updated.'
				);
		}

		return res.json({ data: role });
	} catch (error) {
		throw new Error(`updateDealershipRole(): ${error}`);
	}
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const { method } = req;

		switch (method) {
			case 'GET':
			case 'HEAD':
				return await getDealershipRole(req, res);
			case 'POST':
				return await updateDealershipRole(req, res);
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
