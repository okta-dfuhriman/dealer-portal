import { ErrorResponse, OktaClient } from '../../../_common';

module.exports = async (req, res) => {
	try {
		const {
			query: { id: userId },
		} = req || {};

		const client = new OktaClient({ useApiKey: true });

		const response = await client.clearUserSessions(userId, { oauthTokens: true });

		if (!response.ok) {
			const body = await response.json();

			throw new ErrorResponse({ statusCode: response?.status, ...body }, res);
		}

		return res.status(204).send();
	} catch (error) {
		return res
			.status(error?.statusCode ?? 500)
			.json({ code: error?.code, message: error?.message.toString() });
	}
};
