import { List, Datagrid, DateField } from 'react-admin';
import { Typography } from '@mui/material';

import DealerField from './DealerField';

const DealershipsList = () => (
	<>
		<List
			title='Dealerships'
			perPage={50}
			sort={{ field: 'profile.name', order: 'ASC' }}
		>
			<Datagrid size='medium' optimized>
				<DealerField label='Dealership' sortBy='profile.name' />
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

export default DealershipsList;
