import React from 'react';
import {
	Admin,
	AdminContext,
	AdminUI as RaAdminUI,
	Loading,
	Resource,
	useGetPermissions,
	useAuthState,
} from 'react-admin';
import { QueryClient, useQueryClient } from 'react-query';
import { OktaAuth } from '@okta/okta-auth-js';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import type { QueryClientConfig } from 'react-query';

import { lightTheme } from 'styles/theme';
import Languages from 'i18n';
import { Layout } from 'components';
import Resources from 'resources';
import { LoginPage, Me } from 'pages';
import { AuthProvider, DataProvider } from 'providers';
import { authConfig } from 'config';

const STALE_TIME = import.meta.env.VITE_APP_QUERY_STALE_TIME || 2.5; // Time in **MINUTES** to be used when setting the staleTime configuration.

const queryConfig: QueryClientConfig = {
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * STALE_TIME,
			retry: true,
			refetchOnWindowFocus: false,
		},
	},
};

const queryClient = new QueryClient(queryConfig);

const oktaAuth = new OktaAuth(authConfig.oidc);

oktaAuth.start();

const i18nProvider = polyglotI18nProvider((locale) => {
	if (locale === 'fr') {
		return Languages.fr;
	}

	// Always fallback on english
	return Languages.en;
}, 'en');

const authProvider = new AuthProvider(oktaAuth).init();
const dataProvider = new DataProvider({ authProvider, queryClient }).init();

const AdminUI = () => {
	const getPermissions = useGetPermissions();
	const { isLoading, authenticated: isAuthenticated } = useAuthState();
	const queryClient = useQueryClient();

	const [resources, setResources] = React.useState<
		JSX.Element[] | undefined
	>();

	React.useEffect(() => {
		const renderResources = async () => {
			const permissions = (await getPermissions()) || [];

			if (permissions.length > 0) {
				return Resources.map((props) => {
					let isAllowed = false;

					switch (props.name) {
						case 'users':
							isAllowed =
								permissions.includes(`users:read`) ||
								permissions.includes(`users:read:dealership`);
							if (!isAllowed) {
								queryClient.removeQueries('users');
							}
							break;
						case 'dealerships':
							isAllowed = permissions.includes(
								`${props.name}:read`
							);

							if (!isAllowed) {
								queryClient.removeQueries('dealerships');
							}
							break;
						case 'roles':
							isAllowed = permissions.includes(
								`${props.name}:read`
							);

							if (!isAllowed) {
								queryClient.removeQueries('roles');
							}
							break;
					}
					if (isAllowed) {
						return <Resource {...props} />;
					}
					return <></>;
				});
			}

			return [<></>];
		};

		if (isAuthenticated) {
			renderResources().then((result) => setResources(() => result));
		} else {
			setResources(() => [<></>]);
		}
	}, [isAuthenticated]);

	return (
		<RaAdminUI
			title='Dealer Portal'
			loginPage={LoginPage}
			disableTelemetry
			requireAuth
			layout={Layout}
			ready={Loading}
		>
			{resources}
		</RaAdminUI>
	);
};

const App = () => {
	return (
		<AdminContext
			authProvider={authProvider}
			dataProvider={dataProvider}
			queryClient={queryClient}
			i18nProvider={i18nProvider}
			theme={lightTheme}
		>
			<AdminUI />
		</AdminContext>
	);
};

export default App;
