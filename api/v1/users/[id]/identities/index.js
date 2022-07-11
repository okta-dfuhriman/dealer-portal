import { OktaClient, linkUsers, unlinkUsers } from '../../../../_common';

const handler = async (req, res) => {
	try {
		const client = new OktaClient();

		const { method } = req || {};

		switch (method) {
			case 'DELETE':
				return await unlinkUsers(req, res, client);
			case 'POST':
			default:
				return await linkUsers(req, res, client);
		}
	} catch (error) {
		console.error(error);
		return res.status(error?.statusCode ?? 500).json({
			code: error?.code,
			message: error instanceof Error ? error.toString() : error.message,
		});
	}
};

module.exports = (req, res) => handler(req, res);

export default handler;
