import { TextField, useRecordContext, WrapperField } from 'react-admin';
import type { WrapperFieldProps } from 'react-admin';

const RoleField = (props: Omit<WrapperFieldProps, 'children'>) => {
	const record = useRecordContext();

	return (
		<WrapperField {...props}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'flex-start',
				}}
			>
				<TextField source='profile.roleName' sx={{ pr: 0.5 }} />
				{record?.profile?.description && (
					<>
						-
						<TextField
							source='profile.description'
							sx={{ pl: 0.5 }}
						/>
					</>
				)}
			</div>
		</WrapperField>
	);
};

export default RoleField;
