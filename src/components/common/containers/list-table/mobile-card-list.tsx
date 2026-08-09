import { EllipsisOutlined } from '@ant-design/icons';
import type { BaseRecord } from '@refinedev/core';
import { get, isEmpty, isNil } from 'lodash';
import type { MutableRefObject, ReactNode } from 'react';

import type { ColumnType, ColumnsType, MenuProps } from '@/components/custom-antd';
import {
    CustomButton,
    CustomCard,
    CustomDropdown,
    CustomFlex,
    CustomTypography,
} from '@/components/custom-antd';
import type { TableCustomAction } from './index';
import { getRecordId } from './utils';

const { Text } = CustomTypography;

export interface MobileCardListProps<RecordType extends BaseRecord> {
    columns?: ColumnsType<RecordType>;
    keepOpenRef: MutableRefObject<boolean>;
    openDropdownId: string | number | undefined;
    dataSource: readonly RecordType[] | undefined;
    customRowActions: TableCustomAction<RecordType>[];
    handleCloseDropdown: () => void;
    setOpenDropdownId: (id: string | number | undefined) => void;
    getCustomActionItems: (record: RecordType) => MenuProps['items'];
    renderMobileCard?: (record: RecordType, actionItems: MenuProps['items']) => ReactNode;
}

export function MobileCardList<RecordType extends BaseRecord>({
    columns,
    keepOpenRef,
    openDropdownId,
    dataSource,
    customRowActions,
    handleCloseDropdown,
    setOpenDropdownId,
    getCustomActionItems,
    renderMobileCard,
}: MobileCardListProps<RecordType>) {
    const renderActions = (
        recordId: string | number,
        actions: MenuProps['items'],
        isOpen: boolean,
    ) => {
        if (isEmpty(actions)) return null;

        return (
            <CustomFlex
                justify="end"
                className="mt-2 border-t border-gray-100 pt-3 dark:border-gray-800"
            >
                <CustomDropdown
                    open={isOpen}
                    trigger={['click']}
                    onOpenChange={(open) => {
                        if (open && recordId != null) {
                            setOpenDropdownId(recordId);
                            return;
                        }

                        if (keepOpenRef.current) {
                            keepOpenRef.current = false;
                        } else {
                            setOpenDropdownId(undefined);
                        }
                    }}
                    menu={{
                        items: actions,
                        onClick: (info) => {
                            const customAction = customRowActions.find(
                                (act) => act.key === info.key,
                            );

                            if (info.key !== 'delete' && !customAction?.keepOpen) {
                                handleCloseDropdown();
                            }
                        },
                    }}
                >
                    <CustomButton size="small" type="default" icon={<EllipsisOutlined />}>
                        Thao tác
                    </CustomButton>
                </CustomDropdown>
            </CustomFlex>
        );
    };

    const renderCardContent = (record: RecordType, index: number) => {
        return (
            <CustomFlex vertical gap={8} className="pt-2">
                {(columns || []).map((colItem, colIndex) => {
                    const col = colItem as ColumnType<RecordType>;
                    if (col.dataIndex === 'actions' || col.key === 'actions') return null;

                    let value: unknown = col.dataIndex ? get(record, col.dataIndex) : undefined;
                    if (col.render) {
                        value = col.render(value, record, index);
                    }

                    if (isNil(value) || value === '') return null;

                    return (
                        <CustomFlex
                            gap={16}
                            justify="space-between"
                            key={col.key ?? (col.dataIndex as string | number) ?? colIndex}
                            className="border-b border-gray-100 pb-2 last:border-0 last:pb-0 dark:border-gray-800"
                        >
                            <Text className="text-sm font-medium text-hub-muted flex-shrink-0 pr-2">
                                {col.title as ReactNode}
                            </Text>
                            <Text className="text-sm text-right break-words overflow-hidden">
                                {value as ReactNode}
                            </Text>
                        </CustomFlex>
                    );
                })}
            </CustomFlex>
        );
    };

    return (
        <CustomFlex vertical gap={16} className="w-full">
            {dataSource?.map((record, index) => {
                const actions = getCustomActionItems(record);
                const recordId = getRecordId(record, index);
                const isOpen = recordId != null && openDropdownId === recordId;

                if (renderMobileCard) {
                    return (
                        <CustomFlex key={recordId} className="w-full">
                            {renderMobileCard(record, actions)}
                        </CustomFlex>
                    );
                }

                return (
                    <CustomCard key={recordId} className="w-full" paddingSize="sm">
                        {renderCardContent(record, index)}
                        {renderActions(recordId, actions, isOpen)}
                    </CustomCard>
                );
            })}
        </CustomFlex>
    );
}
