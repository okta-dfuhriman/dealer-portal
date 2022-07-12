import { useRecordContext } from 'react-admin';
import {
	Avatar as MuiAvatar,
	AvatarProps as MuiAvatarProps,
} from '@mui/material';

export interface AvatarProps extends MuiAvatarProps {
	source: string;
	label?: string;
}

const Avatar = ({ sx, ...props }: AvatarProps) => {
	const {
		id,
		profile: { firstName, lastName, profilePicture },
	} = useRecordContext({ ...props });

	return (
		<MuiAvatar
			key={`${id}-avatar`}
			alt={`${firstName} ${lastName}`}
			src={profilePicture}
			sx={{ width: 24, height: 24, ...sx }}
			variant='rounded'
			{...props}
		/>
	);
};

export default Avatar;
