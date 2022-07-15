import { Box, Button } from '@mui/material';
import {
	TabbedForm,
	Edit,
	FormTab,
	useTranslate,
	useLocaleState,
	useTheme,
	TextInput,
} from 'react-admin';

import { darkTheme, lightTheme } from 'styles/theme';

const Me = () => {
	const translate = useTranslate();
	const [locale, setLocale] = useLocaleState();
	const [theme, setTheme] = useTheme();

	return (
		<Edit title={'My Settings'}>
			<TabbedForm>
				<FormTab
					label='resources.users.tabs.me'
					sx={{ maxWidth: '40em' }}
				>
					<Box
						display={{
							xs: 'block',
							sm: 'flex',
							width: '100%',
						}}
					>
						<Box flex={6} mr={{ xs: 0, sm: '0.5em' }}>
							<TextInput
								source='profile.firstName'
								autoComplete='given-name'
								variant='standard'
								isRequired
								fullWidth
							/>
						</Box>
						<Box flex={6} mr={{ xs: 0, sm: '0.5em' }}>
							<TextInput
								source='profile.lastName'
								autoComplete='family-name'
								autoCapitalize='words'
								variant='standard'
								isRequired
								fullWidth
							/>
						</Box>
					</Box>
					<TextInput
						type='email'
						source='profile.email'
						variant='standard'
						isRequired
						fullWidth
						sx={{ flex: 12 }}
					/>
				</FormTab>
				<FormTab
					label='resources.users.tabs.settings'
					sx={{ maxWidth: '40em' }}
					path='settings'
				>
					<Box sx={{ width: '10em', display: 'inline-block' }}>
						{translate('pos.theme.name')}
					</Box>
					<Button
						variant='contained'
						sx={{ margin: '1em' }}
						color={
							theme?.palette?.mode === 'light'
								? 'primary'
								: 'secondary'
						}
						onClick={() => setTheme(lightTheme)}
					>
						{translate('pos.theme.light')}
					</Button>
					<Button
						variant='contained'
						sx={{ margin: '1em' }}
						color={
							theme?.palette?.mode === 'dark'
								? 'primary'
								: 'secondary'
						}
						onClick={() => setTheme(darkTheme)}
					>
						{translate('pos.theme.dark')}
					</Button>
					<Box sx={{ width: '10em', display: 'inline-block' }}>
						{translate('pos.language')}
					</Box>
					<Button
						variant='contained'
						sx={{ margin: '1em' }}
						color={locale === 'en' ? 'primary' : 'secondary'}
						onClick={() => setLocale('en')}
					>
						en
					</Button>
					<Button
						variant='contained'
						sx={{ margin: '1em' }}
						color={locale === 'fr' ? 'primary' : 'secondary'}
						onClick={() => setLocale('fr')}
					>
						fr
					</Button>
				</FormTab>
			</TabbedForm>
		</Edit>
	);
};

export default Me;
