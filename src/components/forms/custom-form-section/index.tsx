'use client';

import { CustomFlex, type FormInstance } from '@/components';
import type { FormMode } from '@/hooks';
import { CardFormSection } from './CardFormSection';
import { CollapseFormSection } from './CollapseFormSection';
import { PlainFormSection } from './PlainFormSection';
import { TabsFormSection } from './TabsFormSection';
import type {
    CustomFormSectionProps,
    ICardFormSection,
    ICollapseFormSection,
    IPlainFormSection,
    ITabsFormSection,
} from './types';

export const CustomFormSection = <TValues extends object = Record<string, unknown>>({
    mode = 'create',
    className = '',
    form,
    sections,
}: CustomFormSectionProps<TValues>) => {
    if (!sections?.length) return null;

    return (
        <CustomFlex vertical className={`w-full ${className}`} gap={16}>
            {sections.map((section, idx) => {
                const sectionKey = section.id || `section-${idx}`;

                switch (section.type) {
                    case 'plain':
                        return (
                            <PlainFormSection
                                form={form}
                                mode={mode}
                                key={sectionKey}
                                section={section as IPlainFormSection<TValues>}
                            />
                        );
                    case 'collapse':
                        return (
                            <CollapseFormSection
                                form={form}
                                mode={mode}
                                key={sectionKey}
                                section={section as ICollapseFormSection<TValues>}
                            />
                        );
                    case 'tabs':
                        return (
                            <TabsFormSection
                                form={form}
                                mode={mode}
                                key={sectionKey}
                                section={section as ITabsFormSection<TValues>}
                            />
                        );
                    case 'card':
                    default:
                        return (
                            <CardFormSection
                                form={form}
                                mode={mode}
                                key={sectionKey}
                                section={section as ICardFormSection<TValues>}
                            />
                        );
                }
            })}
        </CustomFlex>
    );
};
