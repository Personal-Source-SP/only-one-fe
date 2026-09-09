'use client';

import { Spin, SpinProps } from 'antd';

export type CustomSpinProps = SpinProps;

export const CustomSpin = (props: CustomSpinProps) => <Spin {...props} />;
