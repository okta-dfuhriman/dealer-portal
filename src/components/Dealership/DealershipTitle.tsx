import { useRecordContext } from 'react-admin';
import type { Dealership } from './DealershipProfile';

const DealershipTitle = () => {
	const record = useRecordContext<Dealership>();
	return record ? <span>Dealership {record.profile.dealerCode}</span> : null;
};

export default DealershipTitle;
