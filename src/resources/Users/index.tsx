import { People as PeopleIcon } from '@mui/icons-material';

import { User as C } from 'components';

const name = 'users';

const User = {
	key: name,
	name,
	list: C.List,
	create: C.Create,
	edit: C.Edit,
	show: C.Show,
	icon: PeopleIcon,
};

export default User;
