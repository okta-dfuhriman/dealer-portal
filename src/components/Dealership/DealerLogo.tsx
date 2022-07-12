import { useRecordContext } from 'react-admin';
import {
	Avatar as MuiAvatar,
	AvatarProps as MuiAvatarProps,
} from '@mui/material';

export interface DealerLogoProps extends MuiAvatarProps {
	source: string;
	label?: string;
}

const DealerLogo = ({ sx, ...props }: DealerLogoProps) => {
	const {
		id,
		profile: { domain, logo },
	} = useRecordContext({ ...props });

	return (
		<MuiAvatar
			key={`${id}-logo`}
			alt={domain}
			src={logo}
			sx={{ width: 24, height: 24, ...sx }}
			variant='rounded'
			{...props}
		/>
	);
};

export default DealerLogo;
