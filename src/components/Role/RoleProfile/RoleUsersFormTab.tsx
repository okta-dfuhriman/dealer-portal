import {
	FormTab,
	useGetManyReference,
	useRecordContext,
	useTranslate,
} from 'react-admin';
import type { Role } from '.';

const RoleUsersFormTab = (props: any) => {
	const record = useRecordContext<Role>();
	const { isLoading, total } = useGetManyReference('users', {
		target: 'role',
		id: record.id,
	});
	const translate = useTranslate();
	let label = translate('resources.roles.tabs.users');
	if (!isLoading) {
		label += ` (${total})`;
	}
	return <FormTab label={label} {...props} />;
};

export default RoleUsersFormTab;
