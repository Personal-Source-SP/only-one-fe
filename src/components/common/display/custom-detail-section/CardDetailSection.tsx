'use client';

import { CustomCard, CustomFlex } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { ICardDetailSection, IDetailSection } from '@/interfaces';
import type { ComponentType } from 'react';
import { useMemo } from 'react';

export type CardDetailSectionProps<TRecord extends object = Record<string, unknown>> = {
    section: ICardDetailSection<TRecord>;
    record: TRecord;
    CustomDetailSectionComponent: ComponentType<{
        sections?: IDetailSection<TRecord>[];
        record: TRecord;
        className?: string;
    }>;
};

export const CardDetailSection = <TRecord extends object = Record<string, unknown>>({
    section,
    record,
    CustomDetailSectionComponent,
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
            return <CustomDetailSectionComponent sections={sections} record={record} />;
        }
        if (typeof children === 'function') {
            return children(record);
        }
        return children;
    }, [sections, children, record, CustomDetailSectionComponent]);

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
