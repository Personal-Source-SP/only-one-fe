'use client';

import { CustomFlex } from '@/components';

import { CardDetailSection } from './CardDetailSection';
import { DescriptionsDetailSection } from './DescriptionsDetailSection';
import { TableDetailSection } from './TableDetailSection';
import { TabsDetailSection } from './TabsDetailSection';
import type {
    CustomDetailSectionProps,
    ICardDetailSection,
    ICustomDetailSection,
    IDescriptionsDetailSection,
    ITableDetailSection,
    ITabsDetailSection,
} from './types';

export const CustomDetailSection = <TRecord extends object = Record<string, unknown>>({
    sections,
    record,
    className = '',
}: CustomDetailSectionProps<TRecord>) => {
    if (!sections?.length) return null;

    return (
        <CustomFlex vertical gap={16} className={`w-full ${className}`.trim()}>
            {sections.map((section, index) => {
                if (typeof section.visible === 'function' && !section.visible(record)) {
                    return null;
                }
                if (section.visible === false) {
                    return null;
                }

                const sectionKey = section.id || `detail-section-${index}`;

                switch (section.type) {
                    case 'descriptions':
                        return (
                            <DescriptionsDetailSection<TRecord>
                                key={sectionKey}
                                section={section as IDescriptionsDetailSection<TRecord>}
                                record={record}
                            />
                        );
                    case 'table':
                        return (
                            <TableDetailSection<TRecord>
                                key={sectionKey}
                                section={section as ITableDetailSection<TRecord>}
                                record={record}
                            />
                        );
                    case 'tabs':
                        return (
                            <TabsDetailSection<TRecord>
                                key={sectionKey}
                                section={section as ITabsDetailSection<TRecord>}
                                record={record}
                            />
                        );
                    case 'card':
                        return (
                            <CardDetailSection<TRecord>
                                key={sectionKey}
                                section={section as ICardDetailSection<TRecord>}
                                record={record}
                            />
                        );
                    case 'custom':
                        return (
                            <div key={sectionKey} className="w-full">
                                {(section as ICustomDetailSection<TRecord>).render(record)}
                            </div>
                        );
                    default:
                        return null;
                }
            })}
        </CustomFlex>
    );
};
