import {
	List,
	Datagrid,
	EmailField,
	TextField,
	DateField,
	usePermissions,
} from 'react-admin';
import type { RowClickFunction } from 'react-admin';
import { memoize } from 'lodash';
import type { MemoizedFunction } from 'lodash';

import { ListActions as UserListActions, UserLinkField } from 'components';

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
				<UserLinkField label='User' />
				<TextField source='status' />
				<DateField source='created' />
				<DateField source='lastLogin' />
				<EmailField source='profile.email' />
				<TextField source='profile.dealership' />
				<TextField source='profile.role' />
			</Datagrid>
		</List>
	);
};

export default UsersList;
