import { Folder as RoleIcon } from '@mui/icons-material';

import { Role as C } from 'components';

const name = 'roles';

const Roles = {
	key: name,
	name,
	list: C.List,
	create: C.Create,
	edit: C.Edit,
	show: C.Show,
	icon: RoleIcon,
};

export default Roles;
