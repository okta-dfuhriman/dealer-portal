import { JwtValidator, OktaClient, ApiError } from '../../../_common';

import type { ValidateResult } from '../../../_common';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const getDealership = async (req: VercelRequest, res: VercelResponse) => {
	const {
		query: { id },
	} = req;

	console.log(id);
	// Parse the JWT
	const validator = new JwtValidator(
		req,
		{ assertions: { permissions: ['dealerships:read'] } },
		res
	);

	let result = (await validator.validateTokens()) as ValidateResult;

	if (
		!result?.isValid &&
		id &&
		result?.accessToken?.claims?.dealership === id
	) {
		result = (await validator.validateTokens(
			{ permissions: ['dealerships:read:self'] },
			false
		)) as ValidateResult;
	}

	if (!result?.isValid || !result?.accessToken) {
		return res.status(401).send('Unauthorized');
	}

	const client = new OktaClient();

	const data = await client.getDealership(id?.toString());

	return res.json({ data });
};

const updateDealership = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const id = req?.query?.id as string;
		const body = req?.body;

		// 1) Validate the accessToken
		const validator = new JwtValidator(
			req,
			{ assertions: { permissions: ['dealerships:update'] } },
			res
		);

		let result = (await validator.validateTokens()) as ValidateResult;

		if (
			!result?.isValid &&
			id &&
			result?.accessToken?.claims?.dealershipId === id
		) {
			result = (await validator.validateTokens(
				{ permissions: ['dealership:update:self'] },
				false
			)) as ValidateResult;
		}

		if (!result?.isValid || !result?.accessToken) {
			return res.status(401).send('Unauthorized');
		}

		const client = new OktaClient();

		const dealership = await client.updateDealership(body);

		if (!dealership) {
			return res
				.status(500)
				.send(
					'Dealership was not returned after update. The dealership may, or may not, have actually been updated.'
				);
		}

		return res.json({ data: dealership });
	} catch (error: any) {
		throw new Error(`updateDealership(): ${error}`);
	}
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const { method } = req;

		switch (method) {
			case 'GET':
			case 'HEAD':
				return await getDealership(req, res);
			case 'POST':
				return await updateDealership(req, res);
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
