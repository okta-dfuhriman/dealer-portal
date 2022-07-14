import {
	TopToolbar,
	ExportButton,
	CreateButton,
	useListContext,
	useResourceContext,
} from 'react-admin';

const ResourceListActions = () => {
	const { total, isLoading } = useListContext();
	const resource = useResourceContext();

	return (
		<TopToolbar>
			<CreateButton label={`Add ${resource.slice(0, -1)}`} />
			{total > 0 && <ExportButton disabled={isLoading} />}
		</TopToolbar>
	);
};

export default ResourceListActions;
