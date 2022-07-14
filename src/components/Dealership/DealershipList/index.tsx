import { List, Datagrid, DateField, usePermissions } from 'react-admin';
import type { RowClickFunction } from 'react-admin';
import { memoize } from 'lodash';
import type { MemoizedFunction } from 'lodash';
import { Typography } from '@mui/material';

import { ListActions as DealerListActions } from 'components';
import DealershipWrappedField from './DealershipWrappedField';

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

const DealershipsList = () => {
	const { permissions = [] }: { permissions?: string[] } = usePermissions();

	return (
		<>
			<List
				title='Dealerships'
				perPage={50}
				sort={{ field: 'profile.name', order: 'ASC' }}
				actions={<DealerListActions />}
				pagination={false}
				sx={{ mb: 3 }}
			>
				<Datagrid
					size='medium'
					optimized
					rowClick={handleRowClick(permissions)}
				>
					<DealershipWrappedField
						label='Dealership'
						sortBy='profile.name'
					/>
					<DateField source='created' label='Enrolled' />
					<DateField source='lastUpdated' label='Last Updated' />
					<DateField
						source='lastMembershipUpdated'
						label='Last User Enrollment'
					/>
				</Datagrid>
			</List>
			<Typography variant='caption' align='center'>
				Logos powered by <a href='https://clearbit.com'>Clearbit</a>
			</Typography>
		</>
	);
};

export default DealershipsList;
