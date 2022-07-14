import { fetchUtils } from 'react-admin';
import type {
	AuthProvider,
	Options as FetchUtilOptions,
	CreateParams as RaCreateParams,
	DeleteParams,
	GetListParams,
	GetOneParams,
	GetManyParams,
	GetManyReferenceParams,
	UpdateParams,
	CreateResult,
	DeleteResult,
	GetListResult,
	GetOneResult,
	GetManyResult,
	GetManyReferenceResult,
	UpdateResult,
	RaRecord,
} from 'react-admin';
import type { UserProfile } from '@okta/okta-sdk-nodejs';

type GenerateURLOptions = {
	resource: string;
	url?: string;
	params?: Params;
};

type GetParams =
	| GetListParams
	| GetOneParams
	| GetManyParams
	| GetManyReferenceParams
	| SearchParams;

type PostParams = CreateParams | UpdateParams;

type PostResults = CreateResult | UpdateResult;

type GetResults =
	| GetListResult
	| GetOneResult
	| GetManyResult
	| GetManyReferenceResult;

type FetchResult = { data: RaRecord | RaRecord[] };

export type Params = GetParams | PostParams | DeleteParams;

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

export interface CreateParams extends RaCreateParams {
	data: Partial<UserProfile> & { [key: string]: any };
}

export default class HttpClient {
	authProvider: AuthProvider;
	constructor(authProvider: AuthProvider) {
		this.authProvider = authProvider;
	}

	async _getAuth(options?: FetchUtilOptions) {
		const accessToken = await this.authProvider.getAccessToken();

		return {
			...options,
			user: {
				authenticated: true,
				token: `Bearer ${accessToken}`,
				...options?.user,
			},
		} as FetchUtilOptions;
	}

	generateURL({ resource, url, params }: GenerateURLOptions) {
		let path = resource;

		const baseUrl = url || window.location.origin + '/api/v1/';

		if (params) {
			if ('id' in params) {
				path = resource + '/' + params.id;
			} else if (!('data' in params)) {
				path =
					resource +
					'?' +
					new URLSearchParams(Object.entries(params))?.toString();
			}
		}

		return new URL(path, baseUrl);
	}

	async get(resource: string, params: GetParams) {
		const url = this.generateURL({ resource, params });

		return (await this.fetch(url)) as GetResults;
	}

	async post(
		resource: string,
		{ data = {} }: PostParams
	): Promise<PostResults> {
		const url = this.generateURL({ resource });

		return (await this.fetch(url, {
			method: 'post',
			body: JSON.stringify(data),
		})) as PostResults;
	}

	async delete(resource: string, { id, meta, ...params }: DeleteParams) {
		const url = this.generateURL({ resource, params: { id } });

		// TODO add permission handling for delete vs deactivate

		return (await this.fetch(url, {
			method: 'delete',
		})) as DeleteResult<RaRecord>;
	}

	async fetch(url: any, options?: FetchUtilOptions): Promise<FetchResult> {
		const _options = await this._getAuth(options);

		const { json } = await fetchUtils.fetchJson(url, _options);

		if (!json?.data) {
			return {
				data: json,
			};
		}

		return { ...json };
	}
}
