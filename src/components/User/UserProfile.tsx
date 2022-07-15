import { SelectInput, SimpleForm, TextInput } from 'react-admin';
import { Box } from '@mui/material';

import { CreateEditActions as UserCreateEditActions } from 'components';

interface SelectChoice {
	id: string;
	name: string;
}

interface DealerChoice extends Partial<SelectChoice> {
	id: string;
	mts: string;
}

interface Role extends SelectChoice {}

const dealerships = [
	{ id: '01', mts: '02003' },
	{ id: '00g1jsmomcglJ5DO4697', mts: '02032', name: 'Universal Mitsubishi' },
	{ id: '00g1jsa7e1rtflSrY697', mts: '02033', name: 'Gilland Mitsubishi' },
];

const roles = [
	{ id: '00g1hyexmfnlSsUve697', name: 'Org Admin' },
	{ id: '00g1hy3mqpeNBIdHz697', name: 'Dealership Admin' },
	{ id: '00g1kjvihdsCENPbm697', name: 'User' },
];

const optionRenderer = ({ name, ...rest }: DealerChoice | Role) => {
	let label = 'mts' in rest ? rest.mts : name;

	if (name && label !== name) {
		label = `${label} - ${name}`;
	}

	return label || 'unknown';
};

const UserProfile = () => (
	<SimpleForm sx={{ p: 4 }} toolbar={<UserCreateEditActions />}>
		{/* TODO add validation */}
		<Box
			display={{
				xs: 'block',
				sm: 'flex',
				width: '100%',
			}}
		>
			<Box flex={6} mr={{ xs: 0, sm: '0.5em' }}>
				<TextInput
					source='profile.firstName'
					autoComplete='given-name'
					variant='standard'
					isRequired
					fullWidth
				/>
			</Box>
			<Box flex={6} mr={{ xs: 0, sm: '0.5em' }}>
				<TextInput
					source='profile.lastName'
					autoComplete='family-name'
					autoCapitalize='words'
					variant='standard'
					isRequired
					fullWidth
				/>
			</Box>
		</Box>
		<TextInput
			type='email'
			source='profile.email'
			variant='standard'
			isRequired
			fullWidth
			sx={{ flex: 12 }}
		/>
		<Box display={{ xs: 'block', sm: 'flex', width: '100%' }}>
			<Box flex={6} mr={{ xs: 0, sm: '0.5em' }}>
				{/* TODO enhance this to use AutoSelect component that supports searching all dealers via API */}
				{/* TODO enhance to prefill the dealer option and hide it based on user's role & assigned dealer */}
				<SelectInput
					source='profile.Dealer'
					choices={dealerships}
					optionText={optionRenderer}
					optionValue='mts'
					translateChoice={false}
					variant='standard'
					fullWidth
				/>
			</Box>
			<Box flex={6} mr={{ xs: 0, sm: '0.5em' }}>
				<SelectInput
					source='profile.role'
					choices={roles}
					optionText={optionRenderer}
					variant='standard'
					fullWidth
				/>
			</Box>
		</Box>
	</SimpleForm>
);

export default UserProfile;
