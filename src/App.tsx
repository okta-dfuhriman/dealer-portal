import { Admin, CustomRoutes, Resource } from 'react-admin';
import { Route } from 'react-router-dom';
import { QueryClient, QueryClientConfig } from 'react-query';
import { OktaAuth } from '@okta/okta-auth-js';
import polyglotI18nProvider from 'ra-i18n-polyglot';

import { lightTheme } from 'styles/theme';
import Languages from 'i18n';
import { Layout } from 'components';
import Resources from 'resources';
import { LoginPage, Me } from 'pages';
import { AuthProvider, DataProvider } from 'providers';
import { authConfig } from 'config';

const STALE_TIME = import.meta.env.QUERY_STALE_TIME || 2.5; // Time in **MINUTES** to be used when setting the staleTime configuration.

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

const renderResources = (permissions: string[] = []) => {
	return Resources.map((props) => {
		console.log('renderResources()');
		console.log(permissions);
		let isAllowed = false;

		switch (props.name) {
			case 'users':
				isAllowed =
					permissions.includes(`users:read`) ||
					permissions.includes(`users:read:dealership`);
				break;
			case 'dealerships':
			case 'roles':
				isAllowed = permissions.includes(`${props.name}:read`);
				break;
		}
		if (isAllowed) {
			return <Resource {...props} />;
		}
		return <></>;
	});
};

const authProvider = new AuthProvider(oktaAuth).init();
const dataProvider = new DataProvider(authProvider).init();

const App = () => {
	return (
		<Admin
			title='Dealer Portal'
			requireAuth
			authProvider={authProvider}
			dataProvider={dataProvider}
			loginPage={LoginPage}
			layout={Layout}
			i18nProvider={i18nProvider}
			disableTelemetry
			theme={lightTheme}
			ready={LoginPage}
			queryClient={queryClient}
		>
			{renderResources}
			<CustomRoutes>
				<Route key={'me'} path='/me' element={<Me />} />
			</CustomRoutes>
		</Admin>
	);
};

export default App;
