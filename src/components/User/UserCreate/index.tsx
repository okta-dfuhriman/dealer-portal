import { Create, SelectInput, SimpleForm, TextInput } from 'react-admin';
import { Box } from '@mui/material';

import UserCreateActions from './UserCreateActions';

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
	{ id: '01', name: 'Dealership Admin' },
	{ id: '02', name: 'Sales' },
	{ id: '03', name: 'Parts' },
];

const optionRenderer = ({ name, ...rest }: DealerChoice | Role) => {
	let label = 'mts' in rest ? rest.mts : name;

	if (name && label !== name) {
		label = `${label} - ${name}`;
	}

	return label || 'unknown';
};

const UserCreate = () => {
	return (
		<Create redirect='list' sx={{ maxWidth: 600 }}>
			{/* TODO add validation */}
			<SimpleForm
				sx={{ p: 4 }}
				toolbar={<UserCreateActions />}
				// validate={validateForm}
			>
				<Box display={{ xs: 'block', sm: 'flex', width: '100%' }}>
					<Box flex={6} mr={{ xs: 0, sm: '0.5em' }}>
						<TextInput
							source='firstName'
							label='First Name'
							autoComplete='given-name'
							variant='standard'
							isRequired
							fullWidth
						/>
					</Box>
					<Box flex={6} mr={{ xs: 0, sm: '0.5em' }}>
						<TextInput
							source='lastName'
							label='Last Name'
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
					source='email'
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
							source='Dealer'
							choices={dealerships}
							optionText={optionRenderer}
							optionValue='mts'
							translateChoice={false}
							variant='standard'
							isRequired
							fullWidth
						/>
					</Box>
					<Box flex={6} mr={{ xs: 0, sm: '0.5em' }}>
						<SelectInput
							source='role'
							choices={roles}
							optionText={optionRenderer}
							variant='standard'
							isRequired
							fullWidth
						/>
					</Box>
				</Box>
			</SimpleForm>
		</Create>
	);
};

export default UserCreate;
