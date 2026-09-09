'use client';

import { Avatar, AvatarProps } from 'antd';

export type CustomAvatarProps = AvatarProps;

export const CustomAvatar = (props: CustomAvatarProps) => <Avatar {...props} />;
