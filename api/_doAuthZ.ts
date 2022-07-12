import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateJwt } from './_common';
import type { ValidateJwtOptions } from './_common';
import { ErrorResponse } from './_error';

const doAuthZ = async (
	req: VercelRequest,
	res: VercelResponse,
	scopes: string[] = []
) => {
	try {
		// 1) Validate the accessToken

		const options: ValidateJwtOptions | undefined =
			scopes.length > 0
				? {
						assertClaims: {
							'scp.includes': scopes,
						},
				  }
				: undefined;

		const { isValid, error, accessToken } = await validateJwt(options, req);

		if (!isValid) {
			if (error) {
				throw error;
			} else {
				throw new ErrorResponse(401, res);
			}
		}

		return accessToken;
	} catch (error) {}
};

export default doAuthZ;
