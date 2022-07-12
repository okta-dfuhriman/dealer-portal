import React from 'react';
import { useAuthState, useLogin } from 'react-admin';
import { LoadingButton } from '@mui/lab';
import type { LoadingButtonProps } from '@mui/lab';

export interface LoginButtonProps extends LoadingButtonProps {
	label?: string;
}

const LoginButton = ({ label = 'Login', ...props }: LoginButtonProps) => {
	const { isLoading: isLoadingLogin } = useAuthState();

	const [isLoading, setLoading] = React.useState(false);

	const login = useLogin();

	const handleClick = () => {
		setLoading(true);
		login({});
	};

	return (
		<LoadingButton
			variant='outlined'
			type='submit'
			color='primary'
			loading={isLoading || isLoadingLogin}
			onClick={handleClick}
			{...props}
		>
			{label}
		</LoadingButton>
	);
};

export default LoginButton;
