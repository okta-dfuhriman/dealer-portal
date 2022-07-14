import { Show } from 'react-admin';

import UserShowLayout from './UserShowLayout';

const UserShow = () => (
	<Show sx={{ maxWidth: 600 }}>
		<UserShowLayout />
	</Show>
);

export default UserShow;
