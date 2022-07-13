import { Create, SelectInput, SimpleForm, TextInput } from 'react-admin';
import { Box } from '@mui/material';

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
	{ _id: '01', mts: '02003' },
	{ _id: '02', mts: '02032' },
	{ _id: '03', mts: '02033', name: 'Gilland Mitsubishi' },
];

const roles = [
	{ id: '01', name: 'Dealership Admin' },
	{ id: '02', name: 'Sales' },
	{ id: '03', name: 'Parts' },
];

const optionRenderer = ({ name, ...rest }: DealerChoice | Role) => {
	if (name) {
		return name;
	}

	if ('mts' in rest) {
		return rest.mts;
	}

	return 'unknown';
};

const UserCreate = () => {
	return (
		<Create>
			{/* TODO add validation */}
			<SimpleForm
				sx={{ maxWidth: 500 }}
				// validate={validateForm}
			>
				<Box display={{ xs: 'block', sm: 'flex', width: '100%' }}>
					<Box flex={1} mr={{ xs: 0, sm: '0.5em' }}>
						<TextInput
							source='firstName'
							label='First Name'
							autoComplete='given-name'
							isRequired
							fullWidth
						/>
					</Box>
					<Box flex={1} mr={{ xs: 0, sm: '0.5em' }}>
						<TextInput
							source='lastName'
							label='Last Name'
							autoComplete='family-name'
							autoCapitalize='words'
							isRequired
							fullWidth
						/>
					</Box>
				</Box>
				<TextInput type='email' source='email' isRequired fullWidth />
				<Box display={{ xs: 'block', sm: 'flex', width: '100%' }}>
					<Box flex={1} mr={{ xs: 0, sm: '0.5em' }}>
						{/* TODO enhance this to use AutoSelect component that supports searching all dealers via API */}
						<SelectInput
							choices={dealerships}
							optionText={optionRenderer}
							optionValue='mts'
							translateChoice={false}
							isRequired
							fullWidth
						/>
					</Box>
					<Box flex={1} mr={{ xs: 0, sm: '0.5em' }}>
						<SelectInput
							choices={roles}
							optionText={optionRenderer}
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
