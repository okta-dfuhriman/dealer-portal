import React from 'react';
import { Loading, useLogin } from 'react-admin';

const LoginPage = () => {
	const login = useLogin();

	React.useInsertionEffect(() => {
		console.info('Login page: Doing login()');
		login({});
	});

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: 250,
			}}
		>
			<div>
				<Loading loadingPrimary='' loadingSecondary='' />
			</div>
		</div>
	);
};

export default LoginPage;
