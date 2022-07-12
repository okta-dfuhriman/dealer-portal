import { fetchUtils } from 'react-admin';
import type {
	AuthProvider,
	DataProvider as RaDataProvider,
	Options,
} from 'react-admin';
import type { UserProfile } from '@okta/okta-sdk-nodejs';

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

export interface CreateParams {
	data?: Partial<UserProfile> & { [key: string]: any };
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
		if ('id' in params) {
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

export default class DataProvider {
	authProvider: AuthProvider;
	httpClient: HttpClient;
	url?: string;
	constructor(
		authProvider: AuthProvider,
		url?: string,
		httpClient: HttpClient = _httpClient
	) {
		this.authProvider = authProvider;
		this.httpClient = httpClient;
		this.url = url;
	}

	init() {
		return {
			getList: (resource, params) => {
				const {
					pagination: { page, perPage = 200 },
					sort: { field, order = 'asc' },
					filter,
				} = params || {};

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
					url: this.url,
				});

				if (page || filter) {
					console.warn(
						'Pagination and filtering has not been implemented!'
					);
				}

				return this.httpClient(this.authProvider, _url).then(
					({ json }) => ({
						...json,
					})
				);
			},
			getOne: (resource, params) =>
				this.httpClient(
					this.authProvider,
					generateURL({ resource, params })
				).then(({ json: { data } }) => ({ data })),
			getMany: (resource, params) => {
				const { ids } = params || {};

				const searchValues = [];

				for (let i = 0; i < ids.length; i++) {
					searchValues.push(`id eq "${ids[i]}"`);
				}

				const search = searchValues.join(' OR ');

				return this.httpClient(
					this.authProvider,
					generateURL({ resource, params: { search } })
				).then(({ json: { data } }) => ({ data }));
			},
			create: (resource, { data = {}, ...params }) =>
				this.httpClient(this.authProvider, generateURL({ resource }), {
					body: JSON.stringify(data),
				}).then(({ json: { data } }) => ({ data })),
		} as RaDataProvider;
	}
}
