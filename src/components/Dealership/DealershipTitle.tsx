import { useRecordContext } from 'react-admin';

const DealershipTitle = () => {
	const record = useRecordContext<Dealership>();
	return record ? <span>Dealership {record.profile.dealerCode}</span> : null;
};

export default DealershipTitle;
