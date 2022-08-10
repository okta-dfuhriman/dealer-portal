import React from 'react';
import { useRecordContext } from 'react-admin';
import Typography from '@mui/material/Typography';

import type { FieldProps, TextFieldProps } from 'react-admin';
import type { AvatarProps, SxProps } from '@mui/material';
import type { User } from '@okta/okta-sdk-nodejs';

import Avatar from './Avatar';

interface UserNameCardProps extends FieldProps<User> {
	size?: string;
	avatarProps?: AvatarProps;
	textFieldProps?: TextFieldProps;
	sx?: SxProps;
}

const UserNameCard = ({
	size = '25',
	avatarProps,
	textFieldProps,
	...rest
}: UserNameCardProps) => {
	const record = useRecordContext<User>();

	if (record) {
		return (
			<Typography
				variant='body2'
				display='flex'
				flexWrap='nowrap'
				alignItems='center'
				component='div'
				{...textFieldProps}
			>
				<Avatar
					record={record}
					size={size}
					sx={{
						mr: 1,
						mt: -0.5,
						mb: -0.5,
					}}
					{...avatarProps}
				/>
				{record.profile?.firstName} {record.profile?.lastName}
			</Typography>
			// <WrapperField sortBy='profile.lastName' {...rest}>
			// 	<div
			// 		style={{
			// 			display: 'flex',
			// 			justifyContent: 'flex-start',
			// 		}}
			// 	>
			// 		<Avatar
			// 			source='profile.profilePicture'
			// 			label=''
			// 			style={{
			// 				width: parseInt(size, 10),
			// 				height: parseInt(size, 10),
			// 			}}
			// 			sx={{ mr: 1.5 }}
			// 			{...avatarProps}
			// 		/>
			// 		<TextField
			// 			source='profile.firstName'
			// 			label='First Name'
			// 			sx={{ pr: 0.5 }}
			// 			{...textFieldProps}
			// 		/>
			// 		<TextField
			// 			source='profile.lastName'
			// 			label='Last Name'
			// 			{...textFieldProps}
			// 		/>
			// 	</div>
			// </WrapperField>
		);
	}

	return null;
};

export default React.memo<UserNameCardProps>(UserNameCard);
