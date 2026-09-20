'use client';

import { useMemo } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';

import {
    CustomButton,
    CustomCard,
    CustomFlex,
    CustomForm,
    CustomRow,
    CustomTypography,
} from '@/components';

import { CustomFormField } from './CustomFormField';
import type { CustomFormListFieldProps } from './types';

const { Text } = CustomTypography;

export const CustomFormListField = <TValues extends object = Record<string, unknown>>({
    mode,
    field,
    form,
}: CustomFormListFieldProps<TValues>) => {
    const {
        name,
        label,
        subFields,
        addText = 'Thêm mục mới',
        emptyText = 'Chưa có mục nào được thêm.',
        allowAdd = true,
        allowRemove = true,
        min,
        max,
        gutter = [12, 8],
        itemLayout = 'row',
        disabled,
    } = field;

    const isFieldDisabled = useMemo(
        () => (typeof disabled === 'function' ? disabled(mode, form) : Boolean(disabled)),
        [disabled, mode, form],
    );

    const isAddAllowed = useMemo(() => {
        if (isFieldDisabled) return false;
        return typeof allowAdd === 'function' ? allowAdd(mode, form) : Boolean(allowAdd);
    }, [allowAdd, mode, form, isFieldDisabled]);

    const isRemoveAllowed = useMemo(() => {
        if (isFieldDisabled) return false;
        return typeof allowRemove === 'function' ? allowRemove(mode, form) : Boolean(allowRemove);
    }, [allowRemove, mode, form, isFieldDisabled]);

    return (
        <CustomFlex vertical gap={8} className="w-full">
            {label && (
                <Text strong className="text-xs text-hub-text-secondary">
                    {label}
                </Text>
            )}

            <CustomForm.List name={name as string | number | (string | number)[]}>
                {(fields, operation) => {
                    const canAdd = isAddAllowed && (max === undefined || fields.length < max);
                    const canRemove = isRemoveAllowed && (min === undefined || fields.length > min);

                    return (
                        <CustomFlex vertical gap={10} className="w-full">
                            {fields.length === 0 && (
                                <div className="py-3 px-4 text-center rounded-lg border border-dashed border-hub-border text-hub-text-tertiary text-xs bg-hub-card/20">
                                    {emptyText}
                                </div>
                            )}

                            {fields.map((fieldData) => {
                                const renderSubFields = (
                                    <CustomRow
                                        gutter={gutter}
                                        align="middle"
                                        className="flex-1 w-full"
                                    >
                                        {subFields.map((subField) => {
                                            const subFieldName: (string | number)[] = Array.isArray(
                                                subField.name,
                                            )
                                                ? [
                                                      fieldData.name,
                                                      ...(subField.name as (string | number)[]),
                                                  ]
                                                : [fieldData.name, String(subField.name)];

                                            return (
                                                <CustomFormField
                                                    mode={mode}
                                                    form={form}
                                                    withCol={true}
                                                    key={`${fieldData.key}-${String(subField.name)}`}
                                                    field={{
                                                        ...subField,
                                                        name: subFieldName,
                                                        disabled:
                                                            isFieldDisabled || subField.disabled,
                                                    }}
                                                />
                                            );
                                        })}
                                    </CustomRow>
                                );

                                if (itemLayout === 'card') {
                                    return (
                                        <CustomCard
                                            key={fieldData.key}
                                            size="small"
                                            className="relative border-hub-border/60 bg-hub-card/30"
                                            extra={
                                                canRemove && (
                                                    <CustomButton
                                                        danger
                                                        type="text"
                                                        size="small"
                                                        icon={
                                                            <Icon
                                                                icon="mdi:delete-outline"
                                                                className="text-base"
                                                            />
                                                        }
                                                        onClick={() =>
                                                            operation.remove(fieldData.name)
                                                        }
                                                    />
                                                )
                                            }
                                        >
                                            {renderSubFields}
                                        </CustomCard>
                                    );
                                }

                                return (
                                    <CustomFlex
                                        key={fieldData.key}
                                        gap="small"
                                        align="start"
                                        className="w-full items-center"
                                    >
                                        {renderSubFields}
                                        {canRemove && (
                                            <CustomButton
                                                danger
                                                type="text"
                                                icon={
                                                    <Icon
                                                        icon="mdi:delete-outline"
                                                        className="text-base"
                                                    />
                                                }
                                                className="mt-1"
                                                onClick={() => operation.remove(fieldData.name)}
                                            />
                                        )}
                                    </CustomFlex>
                                );
                            })}

                            {canAdd && (
                                <CustomButton
                                    block
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() => operation.add()}
                                    className="border-hub-border/80 hover:border-hub-primary"
                                >
                                    {addText}
                                </CustomButton>
                            )}
                        </CustomFlex>
                    );
                }}
            </CustomForm.List>
        </CustomFlex>
    );
};
