import { Edit } from 'react-admin';

import RoleProfile from '../RoleProfile';
import RoleTitle from '../RoleTitle';

const RoleEdit = () => (
	<Edit redirect='list' title={<RoleTitle />}>
		<RoleProfile />
	</Edit>
);

export default RoleEdit;
