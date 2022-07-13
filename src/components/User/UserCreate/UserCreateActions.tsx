import { useNavigate } from 'react-router-dom';
import { Toolbar, Button, SaveButton, useTranslate } from 'react-admin';

const UserCreateActions = () => {
	const navigate = useNavigate();
	const translate = useTranslate();

	return (
		<Toolbar sx={{ justifyContent: 'space-between' }}>
			<SaveButton />
			<Button
				label={translate('ra.action.cancel')}
				variant='text'
				onClick={() => navigate(-1)}
			/>
		</Toolbar>
	);
};

export default UserCreateActions;
