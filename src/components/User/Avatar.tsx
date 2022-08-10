import { useRecordContext } from 'react-admin';
import MuiAvatar from '@mui/material/Avatar';

import type { SxProps, Theme } from '@mui/material';
import type { User } from '@okta/okta-sdk-nodejs';
import type { FieldProps } from 'react-admin';
export interface AvatarProps extends FieldProps<User> {
	sx?: SxProps<Theme>;
	size?: string;
}

const Avatar = ({ sx, size = '24', ...props }: AvatarProps) => {
	const {
		id,
		profile: { firstName, lastName, profilePicture },
	} = useRecordContext<User>({ ...props });

	return (
		<MuiAvatar
			key={`${id}-avatar`}
			alt={`${firstName} ${lastName}`}
			src={profilePicture}
			style={{ width: parseInt(size, 10), height: parseInt(size, 10) }}
			sx={sx}
			variant='rounded'
			{...props}
		/>
	);
};

export default Avatar;
