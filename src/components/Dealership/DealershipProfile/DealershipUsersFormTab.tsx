import {
	FormTab,
	useGetManyReference,
	useRecordContext,
	useTranslate,
} from 'react-admin';
import type { Dealership } from '.';

const DealershipUsersFormTab = (props: any) => {
	const record = useRecordContext<Dealership>();
	const { isLoading, total } = useGetManyReference('users', {
		target: 'dealership',
		id: record.id,
	});
	const translate = useTranslate();
	let label = translate('resources.dealerships.tabs.users');
	if (!isLoading) {
		label += ` (${total})`;
	}
	return <FormTab label={label} {...props} />;
};

export default DealershipUsersFormTab;
