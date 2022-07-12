import {
	List,
	Datagrid,
	EmailField,
	TextField,
	DateField,
	WrapperField,
} from 'react-admin';

import Avatar from './Avatar';

const UsersList = () => (
	<List
		title='Users'
		perPage={50}
		sort={{ field: 'profile.lastName', order: 'ASC' }}
	>
		<Datagrid size='medium' optimized>
			<WrapperField label='User' sortBy='profile.lastName'>
				<div style={{ display: 'flex', justifyContent: 'flex-start' }}>
					<Avatar
						source='profile.profilePicture'
						label=''
						sx={{ mr: 1.5 }}
					/>
					<TextField
						source='profile.firstName'
						label='First Name'
						sx={{ pr: 0.5 }}
					/>
					<TextField source='profile.lastName' label='Last Name' />
				</div>
			</WrapperField>
			<TextField source='status' />
			<DateField source='created' label='Enrolled' />
			<DateField source='lastLogin' label='Last Login' />
			<EmailField source='profile.email' label='Email' />
			<TextField source='profile.Dealer' label='Dealership' />
		</Datagrid>
	</List>
);

export default UsersList;
