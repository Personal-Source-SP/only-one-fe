'use client';

import { Col, ColProps, Row, RowProps } from 'antd';

export type CustomRowProps = RowProps;

export type CustomColProps = ColProps;

export const CustomRow = (props: CustomRowProps) => <Row {...props} />;

export const CustomCol = (props: CustomColProps) => <Col {...props} />;
