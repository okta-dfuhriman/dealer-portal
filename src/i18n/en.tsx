import { TranslationMessages } from 'react-admin';
import englishMessages from 'ra-language-english';

const customEnglishMessages: TranslationMessages = {
	...englishMessages,
	ra: {
		...englishMessages.ra,
		action: {
			...englishMessages.ra.action,
			create: 'Add',
		},
		page: {
			...englishMessages.ra.page,
			create: 'Add',
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
			updated: 'Successfully updated.',
			created: 'Successfully added.',
			deleted: 'Successfully deactivated.',
			bad_item: 'Bad. Just bad.',
			item_doesnt_exist: 'The thing does not exist or cannot be found.',
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
				name: 'MTS Code',
				description: 'Name',
				domain: 'Website Domain',
			},
			page: {
				edit: 'Edit Dealer',
			},
		},
		users: {
			name: 'User |||| Users',
			fields: {
				'profile.firstName': 'First Name',
				'profile.lastName': 'Last Name',
				'profile.Dealer': 'Dealership',
				'profile.email': 'Email',
				'profile.role': 'Role',
			},
			page: {
				edit: 'Edit Profile',
			},
		},
	},
};

export default customEnglishMessages;
