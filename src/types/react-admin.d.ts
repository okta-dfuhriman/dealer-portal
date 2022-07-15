import 'react-admin';

declare module 'react-admin' {
	interface UserIdentity {
		given_name?: string;
		family_name?: string;
		middle_name?: string;
		email?: string;
		email_verified?: string;
		website?: string;
		gender?: string;
		birthdate?: string;
		nickname?: string;
		preferred_username?: string;
		profile?: string;
		phone_number?: string;
		phone_number_verified?: string;
		address?: {
			street_address?: string;
			locality?: string;
			region?: string;
			postal_code?: string;
			country?: string;
			formatted?: string;
		};
	}
}
