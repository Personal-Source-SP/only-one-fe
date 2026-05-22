'use client';

import { CustomCardPadding, CustomCardShadow } from '@/interfaces';
import { Card, CardProps } from 'antd';
import { ReactNode, useMemo } from 'react';

const CUSTOM_CARD_PADDING_CLASS_MAP: Record<CustomCardPadding, string> = {
    none: '[&_.ant-card-body]:p-0',
    sm: '[&_.ant-card-body]:p-4',
    default: '[&_.ant-card-body]:p-6',
    lg: '[&_.ant-card-body]:p-8',
    responsive: '[&_.ant-card-body]:p-4 sm:[&_.ant-card-body]:p-6 lg:[&_.ant-card-body]:p-8',
};

type CustomCardProps = CardProps & {
    footer?: ReactNode;
    header?: ReactNode;
    description?: ReactNode;
    paddingSize?: CustomCardPadding;
    shadow?: CustomCardShadow;
    footerClassName?: string;
    headerClassName?: string;
};

export type { CustomCardProps };

const renderTitleContent = (title: ReactNode, description: ReactNode) => (
    <div className="flex flex-col gap-1">
        {typeof title === 'string' ? (
            <span className="text-lg font-medium text-hub-title">{title}</span>
        ) : (
            title
        )}
        {typeof description === 'string' ? (
            <p className="text-sm text-hub-muted">{description}</p>
        ) : (
            description
        )}
    </div>
);

export const CustomCard = ({
    title,
    styles,
    footer,
    header,
    children,
    className,
    description,
    paddingSize = 'default',
    shadow = 'none',
    footerClassName,
    headerClassName,
    ...cardProps
}: CustomCardProps) => {
    const resolvedTitle = useMemo(() => {
        if (!title && !description) {
            return undefined;
        }

        if (!description) {
            return title;
        }

        if (!title) {
            return typeof description === 'string' ? (
                <p className="text-sm text-hub-muted">{description}</p>
            ) : (
                description
            );
        }

        return renderTitleContent(title, description);
    }, [description, title]);

    const mergedClassName = [
        'w-full rounded-hub-card border border-hub-border-card bg-hub-section',
        shadow === 'sm' ? 'shadow-sm' : '',
        CUSTOM_CARD_PADDING_CLASS_MAP[paddingSize],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <Card className={mergedClassName} styles={styles} title={resolvedTitle} {...cardProps}>
            {header && <header className={headerClassName ?? 'mb-6 sm:mb-8'}>{header}</header>}
            {children}
            {footer && (
                <footer
                    className={footerClassName ?? 'mt-6 text-center text-sm text-hub-muted sm:mt-8'}
                >
                    {footer}
                </footer>
            )}
        </Card>
    );
};
