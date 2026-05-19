'use client';

import { ElementType } from '@/enums';
import { Card, Flex, Space, Spin } from 'antd';
import { ReactNode } from 'react';

type CustomElementProps = {
    elementType: ElementType;
    title?: string | ReactNode;
    header?: ReactNode;
    actions?: ReactNode[];
    loading?: boolean;
    variant?: 'borderless' | 'outlined';
    children?: ReactNode;
    className?: string;
    description?: string;
};

export const CustomElement = ({
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
            const isTitle = Boolean(title);

            return (
                <Card>
                    {Boolean(description) && <p className="text-gray-500 text-sm">{description}</p>}
                    <Flex
                        align="center"
                        className="mt-0"
                        justify={isTitle ? 'space-between' : 'end'}
                    >
                        {typeof title === 'string' ? (
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                                <p className="text-sm text-slate-500 mt-1">{description}</p>
                            </div>
                        ) : (
                            title
                        )}
                        {Boolean(actions?.length) && <Space size="small">{actions}</Space>}
                    </Flex>
                    {Boolean(children) && children}
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
                    styles={{ body: { padding: '12px 24px' } }}
                    className={`${className ? className : 'bg-white'} md:rounded-xl`}
                >
                    <Space direction="vertical" size="middle" className="w-full max-w-full">
                        {children}
                    </Space>
                </Card>
            );
        }
    }
};
