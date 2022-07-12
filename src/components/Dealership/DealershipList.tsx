import {
	List,
	Datagrid,
	EmailField,
	TextField,
	DateField,
	useRecordContext,
	WrapperField,
	WrapperFieldProps,
} from 'react-admin';
import { Typography } from '@mui/material';

import DealerLogo from './DealerLogo';

const DealerField = (props: Omit<WrapperFieldProps, 'children'>) => {
	const record = useRecordContext();

	return (
		<WrapperField {...props}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'flex-start',
				}}
			>
				<DealerLogo source='profile.logo' label='' sx={{ mr: 1.5 }} />
				<TextField
					source='profile.name'
					label='Name'
					sx={{ pr: 0.5 }}
				/>
				{record?.profile?.description && (
					<>
						<br></br>
						<br></br>
						<TextField source='profile.description' label='' />
					</>
				)}
			</div>
		</WrapperField>
	);
};

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
