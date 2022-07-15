import { SimpleShowLayout, TextField, Show, UrlField } from 'react-admin';
import DealershipTitle from '../DealershipTitle';
const DealershipShow = () => (
	<Show sx={{ maxWidth: 600 }} title={<DealershipTitle />}>
		<SimpleShowLayout sx={{ p: 4 }} spacing={3}>
			<TextField source='profile.dealerCode' variant='body1' />

			<TextField
				source='profile.description'
				variant='body1'
				sx={{ flex: 12, pb: 3 }}
			/>
			<UrlField source='profile.domain' label='Website Domain' />
		</SimpleShowLayout>
	</Show>
);

export default DealershipShow;
