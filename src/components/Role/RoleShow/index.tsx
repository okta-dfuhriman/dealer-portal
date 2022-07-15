import { SimpleShowLayout, TextField, Show } from 'react-admin';
import RoleTitle from '../RoleTitle';
const RoleShow = () => (
	<Show sx={{ maxWidth: 600 }} title={<RoleTitle />}>
		<SimpleShowLayout sx={{ p: 4 }} spacing={3}>
			<TextField source='profile.roleName' variant='body1' />

			<TextField
				source='profile.description'
				variant='body1'
				sx={{ flex: 12, pb: 3 }}
			/>
		</SimpleShowLayout>
	</Show>
);

export default RoleShow;
