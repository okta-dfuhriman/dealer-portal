import { useRecordContext } from 'react-admin';
import type { Role } from './RoleProfile';

const RoleTitle = () => {
	const record = useRecordContext<Role>();
	return record ? <span>Role {record.profile.roleName}</span> : null;
};

export default RoleTitle;
