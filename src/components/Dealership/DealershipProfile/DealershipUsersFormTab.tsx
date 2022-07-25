import {
	FormTab,
	DateField,
	Datagrid,
	EditButton,
	EmailField,
	ReferenceManyField,
	TextField,
	useGetManyReference,
	useRecordContext,
	useTranslate,
} from 'react-admin';
import type { FormTabProps } from 'react-admin';

import { UserLinkField } from 'components/User';

export interface DeaershipUsersFormTabProps extends FormTabProps {
	path?: string;
	reference?: string;
	target?: string;
}

const DealershipUsersFormTab = (props: any) => {
	const record = useRecordContext<Dealership>();
	const { isLoading, total } = useGetManyReference('users', {
		target: 'dealership',
		id: record.id,
	});
	const translate = useTranslate();
	let label = translate('resources.dealerships.tabs.users');
	if (!isLoading) {
		label += ` (${total})`;
	}
	return (
		<FormTab label={label} {...props}>
			<ReferenceManyField reference='users' target='role'>
				<Datagrid
					sx={{
						width: '100%',
						'& .column-comment': {
							maxWidth: '20em',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						},
					}}
				>
					<UserLinkField />
					<TextField source='status' />
					<DateField source='created' label='Enrolled' />
					<DateField source='lastLogin' label='Last Login' />
					<EmailField source='profile.email' label='Email' />
					<TextField source='profile.dealership' label='Dealership' />
					<TextField source='profile.role' label='Role' />
					<EditButton />
				</Datagrid>
			</ReferenceManyField>
		</FormTab>
	);
};

export default DealershipUsersFormTab;
