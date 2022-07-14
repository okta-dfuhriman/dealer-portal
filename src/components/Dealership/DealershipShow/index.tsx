import { SimpleShowLayout, TextField, Show, UrlField } from 'react-admin';

const DealershipShow = () => (
	<Show sx={{ maxWidth: 600 }}>
		<SimpleShowLayout sx={{ p: 4 }} spacing={3}>
			<TextField source='profile.name' variant='body1' />

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
