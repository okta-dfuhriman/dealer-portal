import { Create } from 'react-admin';

import DealershipProfile from '../DealershipProfile';

const DealershipCreate = () => {
	return (
		<Create redirect='list' sx={{ maxWidth: 600 }}>
			<DealershipProfile />
		</Create>
	);
};

export default DealershipCreate;
