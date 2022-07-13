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
		message: {
			...englishMessages.ra.message,
			error: 'Something has gone terribly wrong! :( ',
			invalid_form: "You don't know what you are doing. Try again.",
			no: 'Nope',
			not_found: 'We have no idea where you were trying to go.',
			yes: 'Yup',
			unsaved_changes: "You sure? It doesn't look like you finished. ",
		},
		navigation: {
			...englishMessages.ra.navigation,
			no_results: "These are not the droids you're looking for...",
			no_more_results: 'I can go no further!',
			first: 'Go to the beginning',
			last: 'Go to the end',
			next: 'Next page',
			previous: 'Previous page',
		},
		auth: {
			...englishMessages.ra.auth,
			auth_check_error: 'Please sign in to continue.',
			sign_in_error: 'Something went wrong. Please try again.',
			logout: 'Sign out',
		},
		notification: {
			...englishMessages.ra.notification,
			updated:
				'%{name} sucessfully updated. |||| %{smart_count} %{name} successfully updated.',
			created:
				'%{name} sucessfully added. |||| %{smart_count} %{name} successfully added.',
			deleted:
				'%{name} sucessfully deactivated. |||| %{smart_count} %{name} successfully deactivated.',
			bad_item: '%{name} is invalid.',
			item_doesnt_exist: '%{name} does not exist or cannot be found.',
			logged_out:
				'You have been logged out. Please sign in again to continue.',
			not_authorized: 'You are not authorized to access this resource.',
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
