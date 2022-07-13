import { Admin, Resource } from 'react-admin';
// import { QueryClient, QueryClientConfig } from 'react-query';
import { OktaAuth } from '@okta/okta-auth-js';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import {
	People as PeopleIcon,
	TimeToLeave as DealerIcon,
} from '@mui/icons-material';

import Theme from 'styles/theme';
import Languages from 'i18n';
import { DealershipList, Layout, UserList, UserCreate } from 'components';
import { LoginPage } from 'pages';
import { AuthProvider, DataProvider } from 'providers';
import { authConfig } from 'config';

// const STALE_TIME = import.meta.env.QUERY_STALE_TIME || 2.5; // Time in **MINUTES** to be used when setting the staleTime configuration.

// const onError = (error: unknown) => console.error(error);

// const queryConfig: QueryClientConfig = {
// 	defaultOptions: {
// 		mutations: { onError },
// 		queries: { onError, staleTime: 1000 * 60 * STALE_TIME },
// 	},
// };

// const queryClient = new QueryClient(queryConfig);

const oktaAuth = new OktaAuth(authConfig.oidc);

oktaAuth.start();

const i18nProvider = polyglotI18nProvider((locale) => {
	if (locale === 'fr') {
		return Languages.fr;
	}

	// Always fallback on english
	return Languages.en;
}, 'en');

const resources = [
	<Resource
		name='users'
		list={UserList}
		create={UserCreate}
		icon={PeopleIcon}
		options={{ label: 'Users' }}
	/>,
	<Resource
		name='dealerships'
		list={DealershipList}
		icon={DealerIcon}
		options={{ label: 'Dealers' }}
	/>,
];

const renderResources = (permissions: string[] = []) => {
	return resources.filter((resource) => {
		switch (resource.props.name) {
			case 'users':
				return permissions.includes('user:read');
			case 'dealerships':
				return permissions.includes('dealers:read');
			default:
				return <></>;
		}
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
			theme={Theme.lightTheme}
			ready={LoginPage}
			// queryClient={queryClient}
		>
			{renderResources}
			{/* <CustomRoutes> */}
			{/* <Route path='/' element={<Test />} /> */}
			{/* </CustomRoutes> */}
		</Admin>
	);
};

export default App;
