import { ReferenceField, ReferenceFieldProps } from 'react-admin';

import UserNameCard from './UserNameCard';

interface UserReferenceFieldProps
	extends Omit<ReferenceFieldProps, 'reference' | 'children' | 'source'> {
	source?: string;
}

const UserReferenceField = ({
	source = 'dealership',
	...props
}: UserReferenceFieldProps) => (
	<ReferenceField source={source} reference={`${source}s`} {...props}>
		<UserNameCard />
	</ReferenceField>
);

export default UserReferenceField;
