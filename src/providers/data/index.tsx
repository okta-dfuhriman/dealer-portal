import { DataProvider as RaDataProvider, fetchUtils } from 'react-admin';
import type { AuthProvider, Options } from 'react-admin';

const ORIGIN =
	import.meta.env.VITE_APP_API_ORIGIN || window.location.origin + '/api/v1';

export interface SearchParams {
	q?: string;
	after?: string;
	limit?: number;
	filter?: string;
	search?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	id?: string;
}

export type HttpClient = (
	authProvider: AuthProvider,
	url: string | URL,
	options?: Options
) => Promise<{ status: number; headers: Headers; body: string; json: any }>;

const _httpClient: HttpClient = ({ getAccessToken }, url, options = {}) => {
	// get accessToken
	return getAccessToken().then((accessToken: string) => {
		options.user = {
			authenticated: true,
			token: `Bearer ${accessToken}`,
		};

		return fetchUtils.fetchJson(url, options);
	});
};

type GenerateURLOptions = {
	resource: string;
	url?: string;
	params?: SearchParams;
};

const generateURL = ({ resource, url, params }: GenerateURLOptions) => {
	let path = resource;

	const baseUrl = url || window.location.origin + '/api/v1/';

	if (params) {
		if (params.id) {
			path = resource + '/' + params.id;
		} else {
			path =
				resource +
				'?' +
				new URLSearchParams(Object.entries(params))?.toString();
		}
	}

	return new URL(path, baseUrl);
};

const DataProvider = (
	authProvider: AuthProvider,
	url?: string,
	httpClient: HttpClient = _httpClient
): Partial<RaDataProvider> => {
	return {
		getList: (resource, params) => {
			const {
				pagination: { page, perPage = 200 },
				sort: { field, order = 'asc' },
				filter,
			} = params || {};

			console.log(order);

			const searchParams: SearchParams = {};

			if (field !== 'id') {
				searchParams['sortBy'] = field;
			}

			if (searchParams?.sortBy) {
				searchParams['sortOrder'] =
					order.toLowerCase() as SearchParams['sortOrder'];
			}

			searchParams['limit'] = perPage < 200 ? perPage : 200;

			// TODO implement pagination
			// const page =
			// TODO implement search/filtering
			// const search =
			// const filter =

			const _url = generateURL({
				resource,
				params: searchParams,
				url,
			});

			if (page || filter) {
				console.warn(
					'Pagination and filtering has not been implemented!'
				);
			}

			return httpClient(authProvider, _url).then(({ json }) => ({
				...json,
			}));
		},
		getOne: (resource, params) =>
			httpClient(authProvider, generateURL({ resource, params })).then(
				({ json: { data } }) => ({ data })
			),
		getMany: (resource, params) => {
			const { ids } = params || {};

			const searchValues = [];

			for (let i = 0; i < ids.length; i++) {
				searchValues.push(`id eq "${ids[i]}"`);
			}

			const search = searchValues.join(' OR ');

			return httpClient(
				authProvider,
				generateURL({ resource, params: { search } })
			).then(({ json: { data } }) => ({ data }));
		},
	};
};

export default DataProvider;
