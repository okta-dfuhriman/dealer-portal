import { Edit } from 'react-admin';

import DealershipProfile from '../DealershipProfile';
import DealershipTitle from '../DealershipTitle';

// import DealershipProfile from '../DealershipProfile';

const DealershipEdit = () => (
	<Edit redirect='list' title={<DealershipTitle />}>
		<DealershipProfile />
	</Edit>
);

export default DealershipEdit;
