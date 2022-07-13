import {
	TopToolbar,
	ExportButton,
	CreateButton,
	useListContext,
} from 'react-admin';

const ListActions = () => {
	const { total, isLoading } = useListContext();

	return (
		<TopToolbar>
			<CreateButton label='Add User' />
			{total > 0 && <ExportButton disabled={isLoading} />}
		</TopToolbar>
	);
};

export default ListActions;
