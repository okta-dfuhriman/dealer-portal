import { Edit } from 'react-admin';
import UserProfile from '../UserProfile';

const UserEdit = () => (
	<Edit redirect='list' sx={{ maxWidth: 600 }}>
		<UserProfile />
	</Edit>
);

export default UserEdit;
