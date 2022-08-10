import {
	Datagrid,
	DateField,
	EditButton,
	EmailField,
	FormTab,
	ReferenceManyField,
	required,
	TabbedForm,
	TextField,
	TextInput,
} from 'react-admin';
import type { TabbedFormProps } from 'react-admin';

import DealershipUsersFormTab from './DealershipUsersFormTab';
import { CreateEditActions, UserLinkField } from 'components';

export interface DealershipProfileProps
	extends Omit<TabbedFormProps, 'children'> {
	isCreate?: boolean;
}

const DealershipProfile = ({
	isCreate = false,
	toolbar = <CreateEditActions />,
}: DealershipProfileProps) => (
	<TabbedForm toolbar={toolbar}>
		<FormTab
			label='resources.dealerships.tabs.details'
			sx={{ maxWidth: '40em' }}
		>
			<TextInput
				source='profile.dealerCode'
				autoComplete='none'
				variant='standard'
				isRequired
				fullWidth
			/>

			<TextInput
				source='profile.description'
				autoComplete='none'
				variant='standard'
				fullWidth
				sx={{ flex: 12 }}
			/>
			<TextInput
				source='profile.domain'
				label='Website Domain'
				autoComplete='none'
				variant='standard'
				helperText='Example: mitsubishimotors.com'
				fullWidth
				sx={{ flex: 12 }}
			/>
		</FormTab>
		{!isCreate && (
			<DealershipUsersFormTab path='users'>
				<ReferenceManyField reference='users' target='dealership'>
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
						<TextField source='profile.Dealer' label='Dealership' />
						<TextField source='profile.role' label='Role' />
						<EditButton />
					</Datagrid>
				</ReferenceManyField>
			</DealershipUsersFormTab>
		)}
	</TabbedForm>
);

const req = [required()];

export default DealershipProfile;
