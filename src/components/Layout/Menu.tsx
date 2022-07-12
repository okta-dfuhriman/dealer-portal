import React from 'react';
import Box from '@mui/material/Box';
import {
	People as PeopleIcon,
	TimeToLeave as DealerIcon,
} from '@mui/icons-material';

import {
	useTranslate,
	MenuItemLink,
	MenuProps,
	useSidebarState,
} from 'react-admin';

// import visitors from '../visitors';
// import orders from '../orders';
// import invoices from '../invoices';
// import products from '../products';
// import categories from '../categories';
// import reviews from '../reviews';
// import SubMenu from './SubMenu';

type MenuName = 'menuCatalog' | 'menuSales' | 'menuCustomers';

const Menu = ({ dense = false }: MenuProps) => {
	const [state, setState] = React.useState({
		menuCatalog: true,
		menuSales: true,
		menuCustomers: true,
	});
	const translate = useTranslate();
	const [open] = useSidebarState();

	const handleToggle = (menu: MenuName) => {
		setState((state) => ({ ...state, [menu]: !state[menu] }));
	};

	return (
		<Box
			sx={{
				width: open ? 200 : 50,
				marginTop: 1,
				marginBottom: 1,
				transition: (theme) =>
					theme.transitions.create('width', {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.leavingScreen,
					}),
			}}
		>
			<MenuItemLink
				to='/users'
				state={{ _scrollToTop: true }}
				primaryText={translate(`resources.users.name`, {
					smart_count: 2,
				})}
				leftIcon={<PeopleIcon />}
				dense={dense}
			/>
			<MenuItemLink
				to='/dealerships'
				state={{ _scrollToTop: true }}
				primaryText={translate(`resources.dealerships.name`, {
					smart_count: 2,
				})}
				leftIcon={<DealerIcon />}
				dense={dense}
			/>
		</Box>
	);
};

export default Menu;
