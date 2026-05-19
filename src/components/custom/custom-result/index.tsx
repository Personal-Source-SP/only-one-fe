'use client';

import { Result, ResultProps } from 'antd';

export type CustomResultProps = ResultProps;

export const CustomResult = (props: CustomResultProps) => <Result {...props} />;
