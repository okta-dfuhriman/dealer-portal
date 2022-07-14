import { TimeToLeave as DealerIcon } from '@mui/icons-material';

import { Dealership as C } from 'components';

const name = 'dealerships';

const Dealerships = {
	key: name,
	name,
	list: C.List,
	create: C.Create,
	edit: C.Edit,
	show: C.Show,
	icon: DealerIcon,
};

export default Dealerships;
