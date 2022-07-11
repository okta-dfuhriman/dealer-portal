import { SVGProps } from 'react';
import { useTheme } from '@mui/material/styles';

const Logo = (props: SVGProps<SVGSVGElement>) => {
	const theme = useTheme();
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			height='64'
			version='1.0'
			viewBox='-72 -103.5 624 621'
		>
			<path
				d='M240 0l82 139-82 139-82-138zm0 278h160l80 136H320zm0 0H80L0 414h160z'
				fill='#E60012'
			/>
		</svg>
	);
};

export default Logo;
