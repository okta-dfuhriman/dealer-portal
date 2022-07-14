import type { VercelRequest, VercelResponse } from '@vercel/node';
import { doAuthZ, OktaClient } from '../../../_common';

const getUser = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const {
			query: { id },
		} = req;
		// 1) Validate the accessToken
		// const accessToken = await doAuthZ(req, res, ['users:read:self']);
		const accessToken = await doAuthZ(req, res, ['users:read']);

		const client = new OktaClient();

		if (!accessToken) {
			return res.status(401).send('Unauthorized');
		}

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

// const updateUser = async (req, res) => {
// 	try {
// 		// 1) Validate the accessToken
// 		const accessToken = await doAuthZ(req, res);

// 		const {
// 			query: { id },
// 		} = req || {};

// 		return res.json(await updateUnifiedProfile({ accessToken, body: await req.json(), id }));
// 	} catch (error) {
// 		throw new Error(`updateUser(): ${error}`);
// 	}
// };

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
			// return await updateUser(req, res);
			default:
				return res.status(501).send('');
		}
	} catch (error: any) {
		return res.status(500).json(error);
	}
};
