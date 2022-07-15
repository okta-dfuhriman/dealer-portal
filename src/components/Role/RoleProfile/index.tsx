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
import type { Dealership } from 'components/Dealership/DealershipProfile';

import RoleUsersFormTab from './RoleUsersFormTab';
import { CreateEditActions, UserLinkField } from 'components';

export interface Role extends Omit<Dealership, 'domain' | 'dealerCode'> {
	roleName?: string;
}

export interface RoleProfileProps extends Omit<TabbedFormProps, 'children'> {
	isCreate?: boolean;
}

const RoleProfile = ({
	isCreate = false,
	toolbar = <CreateEditActions />,
}: RoleProfileProps) => (
	<TabbedForm toolbar={toolbar}>
		<FormTab label='resources.roles.tabs.details' sx={{ maxWidth: '40em' }}>
			<TextInput
				source='profile.roleName'
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
		</FormTab>
		{!isCreate && (
			<RoleUsersFormTab path='users'>
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
						<TextField source='profile.Dealer' label='Dealership' />
						<TextField source='profile.role' label='Role' />
						<EditButton />
					</Datagrid>
				</ReferenceManyField>
			</RoleUsersFormTab>
		)}
	</TabbedForm>
);

const req = [required()];

export default RoleProfile;
