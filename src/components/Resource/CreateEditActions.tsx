import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Toolbar,
	Button,
	SaveButton,
	useTranslate,
	usePermissions,
	useResourceContext,
} from 'react-admin';

const CreateEditActions = () => {
	const navigate = useNavigate();
	const translate = useTranslate();

	const [canEdit, setCanEdit] = React.useState(false);
	const { permissions = [] }: { permissions?: string[] } = usePermissions();
	const resource = useResourceContext();

	React.useEffect(() => {
		if (permissions.length > 0) {
			setCanEdit(
				permissions.includes(`${resource}:update`) ||
					permissions.includes(`${resource}:update:dealership`)
			);
		}
	}, [permissions]);

	return (
		<Toolbar sx={{ justifyContent: 'space-between' }}>
			<SaveButton disabled={!canEdit} />
			<Button
				label={translate('ra.action.cancel')}
				variant='text'
				onClick={() => navigate(-1)}
			/>
		</Toolbar>
	);
};

export default CreateEditActions;
