import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ValidateResult } from '../../../_common';
import { OktaClient, JwtValidator } from '../../../_common';

const getUser = async (req: VercelRequest, res: VercelResponse) => {
	try {
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

		if (!result?.isValid && id && result?.accessToken?.claims?.uid === id) {
			result = (await validator.validateTokens(
				{ permissions: ['users:read:self'] },
				false
			)) as ValidateResult;
		}

		if (!result?.isValid || !result?.accessToken) {
			return res.status(401).send('Unauthorized');
		}

		const client = new OktaClient();

		const user = await client.getOktaUser(id as string);

		if (!user) {
			throw new Error('Unable to find user!');
		}

		return res.json(user);
	} catch (error: any | Error) {
		if (error instanceof Error) {
			throw new Error(`getUser(): ${error?.toString()}`);
		}

		throw error;
	}
};

const updateUser = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const id = req?.query?.id as string;
		const body = req?.body;

		// 1) Validate the accessToken
		const validator = new JwtValidator(
			req,
			{ assertions: { permissions: ['users:update:dealership'] } },
			res
		);

		let result = (await validator.validateTokens()) as ValidateResult;

		if (!result?.isValid && id && result?.accessToken?.claims?.uid === id) {
			result = (await validator.validateTokens(
				{ permissions: ['users:update:self'] },
				false
			)) as ValidateResult;
		}

		if (!result?.isValid || !result?.accessToken) {
			return res.status(401).send('Unauthorized');
		}

		const client = new OktaClient();

		const user = await client.updateOktaUser(body);

		if (!user) {
			return res
				.status(500)
				.send(
					'User was not returned after update. The user may, or may not, have actually been updated.'
				);
		}

		return res.json({ data: user });
	} catch (error) {
		throw new Error(`updateUser(): ${error}`);
	}
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const {
			method,
			query: { id },
		} = req;

		switch (method) {
			case 'GET':
			case 'HEAD':
				if (id) {
					return await getUser(req, res);
				}
			case 'POST':
				if (id) {
					return await updateUser(req, res);
				}
			default:
				return res.status(501).send('');
		}
	} catch (error: any) {
		return res.status(500).json(error);
	}
};
