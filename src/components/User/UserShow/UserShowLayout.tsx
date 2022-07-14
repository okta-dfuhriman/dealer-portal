import {
	SimpleShowLayout,
	ChipField,
	EmailField,
	Labeled,
	TextField,
	useShowContext,
} from 'react-admin';
import { Box } from '@mui/material';

const UserShowLayout = () => {
	const {
		record: { profile },
	} = useShowContext();

	return (
		<SimpleShowLayout sx={{ p: 4 }} spacing={3}>
			<Box
				display={{
					xs: 'block',
					sm: 'flex',
					width: '100%',
				}}
			>
				<Box flex={6} mr={{ xs: 0, sm: '0.5em' }}>
					<Labeled>
						<TextField source='profile.firstName' variant='body1' />
					</Labeled>
				</Box>
				<Box flex={6} mr={{ xs: 0, sm: '0.5em' }}>
					<Labeled>
						<TextField source='profile.lastName' variant='body1' />
					</Labeled>
				</Box>
			</Box>
			<EmailField source='profile.email' variant='body1' />
			<Box display={{ xs: 'block', sm: 'flex', width: '100%' }}>
				<Box flex={6} mr={{ xs: 0, sm: '0.5em' }}>
					{/* TODO enhance this to use AutoSelect component that supports searching all dealers via API */}
					{/* TODO enhance to prefill the dealer option and hide it based on user's role & assigned dealer */}
					{profile?.Dealer && (
						<Labeled>
							<ChipField source='Dealer' />
						</Labeled>
					)}
					{!profile?.Dealer && (
						<Labeled label='Dealerships' sx={{ mb: 3 }}>
							<></>
						</Labeled>
					)}
				</Box>
				<Box flex={6} mr={{ xs: 0, sm: '0.5em' }}>
					{profile?.role && (
						<Labeled>
							<ChipField source='role' />
						</Labeled>
					)}
					{!profile?.role && (
						<Labeled label='Roles' sx={{ mb: 3 }}>
							<></>
						</Labeled>
					)}
				</Box>
			</Box>
		</SimpleShowLayout>
	);
};

export default UserShowLayout;
