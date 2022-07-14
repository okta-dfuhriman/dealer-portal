import { Create } from 'react-admin';
import UserProfile from '../UserProfile';

const UserCreate = () => {
	return (
		<Create redirect='list' sx={{ maxWidth: 600 }}>
			<UserProfile />
		</Create>
	);
};

export default UserCreate;
