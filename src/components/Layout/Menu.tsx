import React from 'react';
import Box from '@mui/material/Box';
import { LabelOutlined as DefaultIcon } from '@mui/icons-material';

import {
	useTranslate,
	MenuItemLink,
	useSidebarState,
	useResourceDefinitions,
} from 'react-admin';
import type { MenuProps, ResourceDefinition } from 'react-admin';

const Menu = ({ dense = false }: MenuProps) => {
	const resources = useResourceDefinitions();
	const translate = useTranslate();
	const [open] = useSidebarState();

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
			{Object.keys(resources).map((resource) => (
				<MenuItemLink
					key={resource}
					to={`/${resource}`}
					state={{ _scrollToTop: true }}
					primaryText={translate(`resources.${resource}.name`, {
						smart_count: 2,
					})}
					leftIcon={React.createElement(
						resources[resource as keyof ResourceDefinition].icon ||
							DefaultIcon
					)}
					dense={dense}
				/>
			))}
		</Box>
	);
};

export default Menu;
