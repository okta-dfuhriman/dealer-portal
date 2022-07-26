import React from 'react';
import { Layout, LayoutProps } from 'react-admin';
import { ReactQueryDevtools } from 'react-query/devtools';
import AppBar from './AppBar';
import Menu from './Menu';

export default (props: LayoutProps) => {
	return (
		<>
			<Layout {...props} appBar={AppBar} menu={Menu} />
			<ReactQueryDevtools initialIsOpen={true} />
		</>
	);
};

export * from './themes';
