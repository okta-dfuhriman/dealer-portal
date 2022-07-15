import { Create } from 'react-admin';

import RoleProfile from '../RoleProfile';

const RoleCreate = () => {
	return (
		<Create redirect='list' sx={{ maxWidth: 600 }} title='Add Role'>
			<RoleProfile isCreate />
		</Create>
	);
};

export default RoleCreate;
