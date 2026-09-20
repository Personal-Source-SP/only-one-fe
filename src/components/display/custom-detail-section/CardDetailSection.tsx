'use client';

import { CustomCard, CustomFlex } from '@/components';
import { Icon } from '@iconify/react';
import { useMemo } from 'react';
import { CustomDetailSection } from './index';
import type { ICardDetailSection } from './types';

export type CardDetailSectionProps<TRecord extends object = Record<string, unknown>> = {
    section: ICardDetailSection<TRecord>;
    record: TRecord;
};

export const CardDetailSection = <TRecord extends object = Record<string, unknown>>({
    section,
    record,
}: CardDetailSectionProps<TRecord>) => {
    const { title, icon, badge, extra, sections, children, className = '' } = section;

    const cardTitle = useMemo(() => {
        if (!title && !icon) return undefined;
        return (
            <CustomFlex align="center" gap="small">
                {icon && <Icon icon={icon} className="text-base" />}
                {title && <span>{title}</span>}
                {badge}
            </CustomFlex>
        );
    }, [title, icon, badge]);

    const content = useMemo(() => {
        if (sections?.length) {
            return <CustomDetailSection sections={sections} record={record} />;
        }
        if (typeof children === 'function') {
            return children(record);
        }
        return children;
    }, [sections, children, record]);

    return (
        <CustomCard
            size="small"
            title={cardTitle}
            extra={extra}
            className={`w-full border-hub-border/60 bg-hub-card/30 ${className}`.trim()}
        >
            {content}
        </CustomCard>
    );
};
