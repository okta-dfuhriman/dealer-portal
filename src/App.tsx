import React from 'react';
import {
	Admin,
	AuthProvider as RaAuthProvider,
	CustomRoutes,
	Loading,
	Resource,
} from 'react-admin';
import { QueryClient, QueryClientConfig } from 'react-query';
import polyglotI18nProvider from 'ra-i18n-polyglot';

import Theme from 'styles/theme';
import Languages from 'i18n';
import { Layout } from 'components';
import { LoginPage } from 'pages';
import { AuthProvider, DataProvider } from 'providers';

const STALE_TIME = import.meta.env.QUERY_STALE_TIME || 2.5; // Time in **MINUTES** to be used when setting the staleTime configuration.

const onError = (error: unknown) => console.error(error);

const queryConfig: QueryClientConfig = {
	defaultOptions: {
		mutations: { onError },
		queries: { onError, staleTime: 1000 * 60 * STALE_TIME },
	},
};

const queryClient = new QueryClient(queryConfig);

const i18nProvider = polyglotI18nProvider((locale) => {
	if (locale === 'fr') {
		return Languages.fr;
	}

	// Always fallback on english
	return Languages.en;
}, 'en');

const App = () => {
	return (
		<Admin
			title='Dealer Portal'
			requireAuth
			authProvider={AuthProvider}
			dataProvider={DataProvider}
			loginPage={LoginPage}
			layout={Layout}
			i18nProvider={i18nProvider}
			disableTelemetry
			theme={Theme.lightTheme}
			queryClient={queryClient}
		>
			<Resource name='users' />
			<Resource name='dealers' />
			{/* <CustomRoutes> */}
			{/* <Route path='/' element={<Test />} /> */}
			{/* </CustomRoutes> */}
		</Admin>
	);
};

export default App;
