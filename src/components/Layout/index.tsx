import React from 'react';
import { Layout, LayoutProps } from 'react-admin';
import AppBar from './AppBar';
import Menu from './Menu';

const isProd = import.meta.env.PROD;
export default (props: LayoutProps) => {
	const [devTools, setDevTools] = React.useState(<></>);

	React.useEffect(() => {
		const loadDevTools = async () => await import('react-query/devtools');

		if (!isProd) {
			loadDevTools().then(({ ReactQueryDevtools }) =>
				setDevTools(<ReactQueryDevtools initialIsOpen={true} />)
			);
		}
	}, [isProd]);

	return (
		<>
			<Layout {...props} appBar={AppBar} menu={Menu} />
			{devTools}
		</>
	);
};

export * from './themes';
