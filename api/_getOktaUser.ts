import { JwtClaims as Claims } from '@okta/jwt-verifier';
import { OktaClient } from './_common';

const getOktaUser = async (
	accessToken: Claims,
	client: OktaClient = new OktaClient()
) => {
	const user = await client.getOktaUser(accessToken?.sub);

	if (!user) {
		throw new Error('Unable to find user!');
	}

	return user;
};

export default getOktaUser;
