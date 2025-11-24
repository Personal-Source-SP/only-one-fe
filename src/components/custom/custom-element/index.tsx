'use client';

import { ElementType } from '@/enums';
import { Card, Flex, Space, Spin } from 'antd';
import { ReactNode } from 'react';

type CustomElementProps = {
    elementType: ElementType;
    title?: string;
    header?: ReactNode;
    actions?: ReactNode[];
    loading?: boolean;
    variant?: 'borderless' | 'outlined';
    children?: ReactNode;
    className?: string;
    description?: string;
};

const CustomElement = ({
    elementType,
    title,
    loading = false,
    className,
    description,
    header,
    children,
    actions,
    variant = 'borderless',
}: CustomElementProps) => {
    switch (elementType) {
        case ElementType.TITLE: {
            return (
                <Card>
                    {Boolean(description) && <p className="text-gray-500 text-sm">{description}</p>}
                    <Flex justify="space-between" align="center" className="mt-0">
                        <h2 className="text-2xl font-semibold mb-0">{title}</h2>
                        {Boolean(actions?.length) && <Space size="small">{actions}</Space>}
                        {Boolean(children) && children}
                    </Flex>
                </Card>
            );
        }

        case ElementType.CONTAINER: {
            return (
                <Space
                    size="middle"
                    direction="vertical"
                    className={`${className ? className : 'bg-white'} w-full p-3 md:rounded-xl`}
                >
                    <Spin spinning={loading}>{children}</Spin>
                </Space>
            );
        }

        case ElementType.CARD: {
            return (
                <Card
                    title={header}
                    loading={loading}
                    actions={actions}
                    variant={variant}
                    className={`${className ? className : 'bg-white'} p-0 md:rounded-xl`}
                >
                    {children}
                </Card>
            );
        }
    }
};

export default CustomElement;
