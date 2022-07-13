import { TranslationMessages } from 'react-admin';
import englishMessages from 'ra-language-english';

const customEnglishMessages: TranslationMessages = {
	...englishMessages,
	ra: {
		...englishMessages.ra,
		action: {
			...englishMessages.ra.action,
			create: 'Add %{name}',
		},
		page: {
			...englishMessages.ra.page,
			create: 'Add %{name}',
		},
	},
	pos: {
		search: 'Search',
		configuration: 'Settings',
		language: 'Language',
		theme: {
			name: 'Theme',
			light: 'Light',
			dark: 'Dark',
		},
		menu: {
			users: 'Users',
			dealerships: 'Dealerships',
		},
	},
	resources: {
		dealerships: {
			name: 'Dealership |||| Dealerships',
			fields: {
				commands: 'Orders',
				first_seen: 'First seen',
				groups: 'Segments',
				last_seen: 'Last seen',
				last_seen_gte: 'Visited Since',
				name: 'Name',
				total_spent: 'Total spent',
				password: 'Password',
				confirm_password: 'Confirm password',
				stateAbbr: 'State',
			},
			filters: {},
			fieldGroups: {
				identity: 'Identity',
				address: 'Address',
				stats: 'Stats',
				history: 'History',
				password: 'Password',
				change_password: 'Change Password',
			},
			errors: {
				password_mismatch:
					'The password confirmation is not the same as the password.',
			},
		},
		users: {
			name: 'User |||| Users',
			fields: {
				firstName: 'First Name',
				lastName: 'Last Name',
				Dealer: 'Dealership',
				email: 'Email',
				role: 'Role',
			},
			page: {
				edit: 'Edit Profile',
			},
		},
	},
};

export default customEnglishMessages;
