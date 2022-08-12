import type {
	AuthProvider,
	DataProvider as RaDataProvider,
	GetListParams,
} from 'react-admin';

import HttpClient from './HttpClient';
import type { SearchParams } from './HttpClient';
import type { QueryClient } from 'react-query';

const defaultGetUsersKey = [
	'users',
	'getList',
	{
		pagination: { page: 1, perPage: 25 },
		sort: { field: 'profile.lastName', order: 'ASC' },
		filter: {},
	},
];
const defaultGetDealersKey = [
	'dealerships',
	'getList',
	{
		pagination: {
			page: 1,
			perPage: 50,
		},
		sort: {
			field: 'profile.name',
			order: 'ASC',
		},
		filter: {},
	},
];

const defaultGetRolesKey = [
	'roles',
	'getList',
	{
		pagination: {
			page: 1,
			perPage: 50,
		},
		sort: {
			field: 'profile.name',
			order: 'ASC',
		},
		filter: {},
	},
];

interface DataProviderParams {
	authProvider: AuthProvider;
	url?: string;
	httpClient?: HttpClient;
	queryClient?: QueryClient;
}

// const ORIGIN = import.meta.env.VITE_APP_API_ORIGIN || window.location.origin + '/api/v1';
interface GetListOptions {
	resource: string;
	params: GetListParams;
	httpClient: HttpClient;
}
const getList = async ({ resource, params, httpClient }: GetListOptions) => {
	const {
		pagination: { page = 1, perPage = 200 },
		sort: { field = 'id', order = 'asc' },
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

	if (page || filter) {
		console.warn('Pagination and filtering has not been implemented!');
	}

	return httpClient.get(resource, searchParams);
};

export default class DataProvider {
	authProvider: AuthProvider;
	httpClient: HttpClient;
	url?: string;
	queryClient?: QueryClient;
	constructor({
		authProvider,
		url,
		httpClient,
		queryClient,
	}: DataProviderParams) {
		this.authProvider = authProvider;
		this.httpClient = httpClient || new HttpClient(authProvider);

		if (url) {
			this.url = url;
		}

		if (queryClient) {
			this.queryClient = queryClient;

			// Prefetch data to make things load faster
			this.queryClient.prefetchQuery(defaultGetUsersKey, () =>
				getList({
					resource: 'users',
					params: defaultGetUsersKey[2] as GetListParams,
					httpClient: this.httpClient,
				})
			);

			this.queryClient.prefetchQuery(defaultGetDealersKey, () =>
				getList({
					resource: 'dealerships',
					params: defaultGetDealersKey[2] as GetListParams,
					httpClient: this.httpClient,
				})
			);

			this.queryClient.prefetchQuery(defaultGetRolesKey, () =>
				getList({
					resource: 'roles',
					params: defaultGetRolesKey[2] as GetListParams,
					httpClient: this.httpClient,
				})
			);
		}
	}

	init() {
		return {
			getList: (resource, params) =>
				getList({ resource, params, httpClient: this.httpClient }),
			getOne: (resource, params) => this.httpClient.get(resource, params),
			getMany: (resource, params) => {
				const { ids } = params || {};

				const searchValues = [];

				for (let i = 0; i < ids.length; i++) {
					searchValues.push(`id eq "${ids[i]}"`);
				}

				const search = searchValues.join(' OR ');

				return this.httpClient.get(resource, params);
			},
			getManyReference: (resource, params) =>
				this.httpClient.get(resource, params),
			update: (resource, params) =>
				this.httpClient.post(resource, params),
			updateMany: (resource, params) => Promise.resolve({ data: [] }),
			create: (resource, { data = {}, ...params }) =>
				this.httpClient.post(resource, { data }),
			delete: (resource, params) =>
				this.httpClient.delete(resource, params),
			// API does not handle deleteMany so just calling `delete` n times
			deleteMany: (resource, params) =>
				Promise.all(
					params.ids.map((id) =>
						this.httpClient.delete(resource, { id })
					)
				),
		} as RaDataProvider;
	}
}
