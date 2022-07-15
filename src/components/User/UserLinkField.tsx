import { Link, FieldProps, useRecordContext } from 'react-admin';
import type { User } from '@okta/okta-sdk-nodejs';

import UserNameCard from './UserNameCard';

const UserLinkField = (props: FieldProps<User>) => {
	const record = useRecordContext<User>();
	if (!record) {
		return null;
	}
	return (
		<Link to={`/users/${record.id}`}>
			<UserNameCard />
		</Link>
	);
};

export default UserLinkField;
