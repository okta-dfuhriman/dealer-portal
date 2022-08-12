import * as React from 'react';
import {
	AppBar as RaAppBar,
	Logout,
	UserMenu,
	useAuthState,
	useTranslate,
} from 'react-admin';
import { Link } from 'react-router-dom';
import {
	Box,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Typography,
	useMediaQuery,
	Theme,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

import Logo from './Logo';

const ConfigurationMenu = React.forwardRef((props, ref) => {
	const translate = useTranslate();
	return (
		<MenuItem
			component={Link}
			// @ts-ignore
			ref={ref}
			{...props}
			to='/me'
		>
			<ListItemIcon>
				<SettingsIcon />
			</ListItemIcon>
			<ListItemText>{translate('pos.configuration')}</ListItemText>
		</MenuItem>
	);
});

const AppBar = (props: any) => {
	const { authenticated: isAuthenticated } = useAuthState();
	const isLargeEnough = useMediaQuery<Theme>((theme) =>
		theme.breakpoints.up('sm')
	);
	return (
		<RaAppBar
			{...props}
			color='secondary'
			elevation={1}
			userMenu={
				<>
					{isAuthenticated && (
						<UserMenu>
							{/* <ConfigurationMenu /> */}
							<Logout />
						</UserMenu>
					)}
				</>
			}
		>
			<Typography
				variant='h6'
				color='inherit'
				sx={{
					flex: 1,
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					overflow: 'hidden',
				}}
				id='react-admin-title'
			/>

			{isLargeEnough && <Logo />}
			{isLargeEnough && <Box component='span' sx={{ flex: 1 }} />}
		</RaAppBar>
	);
};

export default AppBar;
