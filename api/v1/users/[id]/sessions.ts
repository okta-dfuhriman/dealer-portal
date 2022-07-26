import { ApiError, OktaClient } from '../../../_common';
import type { VercelRequest, VercelResponse } from '@vercel/node';

module.exports = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const {
			query: { id: userId },
		} = req || {};

		const client = new OktaClient({ useApiKey: true });

		const response = await client.clearUserSessions(userId as string, {
			oauthTokens: true,
		});

		if (!response.ok) {
			const body = await response.json();

			throw new ApiError({ statusCode: response?.status, message: body });
		}

		return res.status(204).send('');
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
