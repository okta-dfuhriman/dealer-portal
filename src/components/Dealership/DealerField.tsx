import { TextField, useRecordContext, WrapperField } from 'react-admin';
import type { WrapperFieldProps } from 'react-admin';
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
						<Typography variant='caption'>
							{record.profile.description}
						</Typography>
					</>
				)}
			</div>
		</WrapperField>
	);
};

export default DealerField;
