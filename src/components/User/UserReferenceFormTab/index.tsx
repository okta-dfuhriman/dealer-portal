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
import type {
	DatagridProps,
	FormTabProps,
	ReferenceManyFieldProps,
} from 'react-admin';

import { UserLinkField } from 'components';

export interface UsersReferenceFormTabProps extends FormTabProps {
	path?: string;
	referenceProps: UsersReferenceManyFieldProps;
	datagridProps?: DatagridProps;
	target?: string;
}

interface UsersReferenceManyFieldProps
	extends Omit<ReferenceManyFieldProps, 'children'> {
	children?: React.ReactNode;
}

const UsersReferenceFormTab = ({
	datagridProps,
	referenceProps,
	...props
}: UsersReferenceFormTabProps) => {
	const record = useRecordContext<Dealership>();
	const { isLoading, total } = useGetManyReference('users', {
		target: 'dealership',
		id: record.id,
	});
	const translate = useTranslate();

	let label = props?.label || translate('resources.dealerships.tabs.users');
	const reference = referenceProps?.reference || 'users';

	if (!isLoading) {
		label += ` (${total})`;
	}
	return (
		<FormTab {...{ ...props, label }}>
			<ReferenceManyField {...{ ...referenceProps, reference }}>
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

export default UsersReferenceFormTab;
