'use client';

import { CustomFlex, type FormInstance } from '@/components/custom-antd';
import type { FormMode } from '@/hooks';
import type {
    ICardFormSection,
    ICollapseFormSection,
    IFormSection,
    IPlainFormSection,
    ITabsFormSection,
} from '@/interfaces';
import { CardFormSection } from './CardFormSection';
import { CollapseFormSection } from './CollapseFormSection';
import { PlainFormSection } from './PlainFormSection';
import { TabsFormSection } from './TabsFormSection';

export type CustomFormSectionProps<TValues extends object = Record<string, unknown>> = {
    mode: FormMode;
    className?: string;
    form?: FormInstance<TValues>;
    sections?: IFormSection<TValues>[];
};

export const CustomFormSection = <TValues extends object = Record<string, unknown>>({
    mode,
    className = '',
    form,
    sections,
}: CustomFormSectionProps<TValues>) => {
    if (!sections?.length) return null;

    return (
        <CustomFlex vertical className={`w-full ${className}`.trim()}>
            {sections.map((section, index) => {
                if (typeof section.visible === 'function' && !section.visible(mode, form)) {
                    return null;
                }

                if (section.visible === false) {
                    return null;
                }

                const sectionKey = section.id || `section-${index}`;

                switch (section.type) {
                    case 'plain':
                        return (
                            <PlainFormSection<TValues>
                                form={form}
                                mode={mode}
                                key={sectionKey}
                                section={section as IPlainFormSection<TValues>}
                            />
                        );
                    case 'collapse':
                        return (
                            <CollapseFormSection<TValues>
                                form={form}
                                mode={mode}
                                key={sectionKey}
                                section={section as ICollapseFormSection<TValues>}
                            />
                        );
                    case 'tabs':
                        return (
                            <TabsFormSection<TValues>
                                form={form}
                                mode={mode}
                                key={sectionKey}
                                section={section as ITabsFormSection<TValues>}
                            />
                        );
                    case 'card':
                    default:
                        return (
                            <CardFormSection<TValues>
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
