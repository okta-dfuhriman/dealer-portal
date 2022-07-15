import { JwtClaims } from '@okta/jwt-verifier';

declare module '@okta/jwt-verifier' {
	interface JwtClaims {
		dealershipId?: string;
		dealership?: string;
		permissions?: string[];
	}
}
