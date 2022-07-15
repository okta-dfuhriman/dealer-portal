import { SimpleForm, TextInput } from 'react-admin';

import { CreateEditActions as DealershipCreateEditActions } from 'components';

const DealershipProfile = () => {
	return (
		<SimpleForm
			sx={{ p: 4 }}
			toolbar={<DealershipCreateEditActions />}
			// validate={validateForm}
		>
			<TextInput
				source='profile.name'
				autoComplete='none'
				variant='standard'
				isRequired
				fullWidth
			/>

			<TextInput
				source='profile.description'
				autoComplete='none'
				variant='standard'
				fullWidth
				sx={{ flex: 12 }}
			/>
			<TextInput
				source='profile.domain'
				label='Website Domain'
				autoComplete='none'
				variant='standard'
				helperText='Example: mitsubishimotors.com'
				fullWidth
				sx={{ flex: 12 }}
			/>
		</SimpleForm>
	);
};

export default DealershipProfile;
