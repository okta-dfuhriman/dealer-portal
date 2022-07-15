import { TextField, useRecordContext, WrapperField } from 'react-admin';
import type { WrapperFieldProps } from 'react-admin';
import { Box, Typography } from '@mui/material';

import DealerLogo from '../DealerLogo';

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
				<TextField source='profile.dealerCode' sx={{ pr: 0.5 }} />
				{record?.profile?.description && (
					<>
						-
						<TextField
							source='profile.description'
							label='Name'
							sx={{ pl: 0.5 }}
						/>
					</>
				)}
			</div>
		</WrapperField>
	);
};

export default DealerField;
