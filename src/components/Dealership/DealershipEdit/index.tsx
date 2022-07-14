import { Edit } from 'react-admin';

import DealershipProfile from '../DealershipProfile';

const DealershipEdit = () => (
	<Edit redirect='list' sx={{ maxWidth: 600 }}>
		<DealershipProfile />
	</Edit>
);

export default DealershipEdit;
