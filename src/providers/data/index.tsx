import type {
	AuthProvider,
	DataProvider as RaDataProvider,
	DeleteParams,
} from 'react-admin';

import HttpClient from './HttpClient';
import type { SearchParams } from './HttpClient';

// const ORIGIN = import.meta.env.VITE_APP_API_ORIGIN || window.location.origin + '/api/v1';
export default class DataProvider {
	authProvider: AuthProvider;
	httpClient: HttpClient;
	url?: string;
	constructor(
		authProvider: AuthProvider,
		url?: string,
		httpClient?: HttpClient
	) {
		this.authProvider = authProvider;
		this.httpClient = httpClient || new HttpClient(authProvider);
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

				if (page || filter) {
					console.warn(
						'Pagination and filtering has not been implemented!'
					);
				}

				return this.httpClient.get(resource, searchParams);
			},
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
