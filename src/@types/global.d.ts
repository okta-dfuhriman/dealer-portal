import type { Group } from '@okta/okta-sdk-nodejs';

declare global {
	interface Dealership
		extends Omit<Partial<Group>, '_embedded' | '_links' | 'profile'> {
		_embedded?: { [name: string]: unknown };
		_links?: { [name: string]: unknown };
		profile: GroupProfile;
	}
}
