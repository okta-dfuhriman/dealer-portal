import { OktaClient } from './_common';
import getUnifiedProfile from './_getUnifiedProfile';

const updateUser = async ({ accessToken, body, id, client = new OktaClient() }) => {
	// `id` should be the primary profile, but we will update both the primary and logged in user's profiles
	const {
		claims: { sub, uid },
	} = accessToken;

	const users = [sub];

	if (sub !== uid) {
		users.push(uid);
	}

	// 1) iterate through the users
	for (let i = 0; i < users.length; i++) {
		// a) fetch the user
		const user = await client.getUser(users[i]);

		// b) clean the profile up
		user.profile = await client.cleanProfile({
			...user.profile,
			...body,
		});

		// c) do the update
		user.update();
	}

	// 2) fetch and return a fresh unifiedProfile
	return await getUnifiedProfile(accessToken);
};

export default updateUser;
