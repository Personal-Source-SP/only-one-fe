'use client';

import { Button, ButtonProps } from 'antd';

export type CustomButtonProps = ButtonProps;

export const CustomButton = Object.assign((props: CustomButtonProps) => <Button {...props} />, {
    Group: Button.Group,
});
