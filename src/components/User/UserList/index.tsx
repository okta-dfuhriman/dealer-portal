import {
	List,
	Datagrid,
	EmailField,
	TextField,
	DateField,
	usePermissions,
	WrapperField,
} from 'react-admin';
import type { RowClickFunction } from 'react-admin';
import { memoize } from 'lodash';
import type { MemoizedFunction } from 'lodash';

import Avatar from '../Avatar';
import { ListActions as UserListActions } from 'components';

type HandleRowClick = (permissions: string[]) => RowClickFunction;

const handleRowClick: HandleRowClick & MemoizedFunction = memoize(
	(permissions) => (id, resource, record) => {
		let canEdit = permissions.includes(`${resource}:update`);
		let canView = permissions.includes(`${resource}:read`);

		if (canEdit) {
			return Promise.resolve('edit');
		}

		if (canView) {
			return Promise.resolve('show');
		}

		return Promise.reject();
	}
);

const UsersList = () => {
	const { permissions = [] }: { permissions?: string[] } = usePermissions();

	return (
		<List
			title='Users'
			perPage={25}
			sort={{ field: 'profile.lastName', order: 'ASC' }}
			actions={<UserListActions />}
		>
			<Datagrid
				size='medium'
				optimized
				rowClick={handleRowClick(permissions)}
			>
				<WrapperField label='User' sortBy='profile.lastName'>
					<div
						style={{
							display: 'flex',
							justifyContent: 'flex-start',
						}}
					>
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
						<TextField
							source='profile.lastName'
							label='Last Name'
						/>
					</div>
				</WrapperField>
				<TextField source='status' />
				<DateField source='created' label='Enrolled' />
				<DateField source='lastLogin' label='Last Login' />
				<EmailField source='profile.email' label='Email' />
				<TextField source='profile.Dealer' label='Dealership' />
				<TextField source='profile.role' label='Role' />
			</Datagrid>
		</List>
	);
};

export default UsersList;
