import { fetchUtils, Options, useAuthProvider } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

const ORIGIN =
	import.meta.env.VITE_APP_API_ORIGIN || window.location.origin + '/api';

const httpClient = (url: string, options: Options = {}) => {
	const { getAccessToken } = useAuthProvider();

	const headers = new Headers(options?.headers);

	// get accessToken
	return getAccessToken().then((accessToken: string) => {
		headers.append('Authorization', `Bearer ${accessToken}`);

		return fetchUtils.fetchJson(url, options);
	});
};

const dataProvider = simpleRestProvider(ORIGIN, httpClient);

export default dataProvider;
