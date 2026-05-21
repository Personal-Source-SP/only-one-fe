'use client';

import {
    ColumnsType,
    CustomButton,
    CustomCard,
    CustomCheckbox,
    CustomDescriptions,
    CustomDropdown,
    CustomFlex,
    CustomPopconfirm,
    ItemType,
} from '@/components/custom';
import { useMainContext } from '@/contexts/MainContext';
import { MessageType } from '@/enums';
import { ActionTableItem } from '@/interfaces';
import { DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { useDelete } from '@refinedev/core';

type ListItemProps = {
    record: any;
    columns: ColumnsType<any>;
    resource?: string;
    selected?: boolean;
    disabled?: boolean;
    currentPage?: number;
    actionItems?: ActionTableItem[];
    onRefetch?: () => void;
    onSelectChange?: (record: any, selected: boolean) => void;
    setCurrentPage?: (page: number) => void;
};

export const ListItem = ({
    record,
    columns,
    resource,
    selected,
    disabled,
    actionItems,
    onRefetch,
    onSelectChange,
}: ListItemProps) => {
    const { handleMessage } = useMainContext();

    const { mutate: deleteRecord } = useDelete();

    const handleDelete = () => {
        deleteRecord(
            {
                id: record.id,
                resource: resource || '',
                errorNotification: false,
                successNotification: false,
            },
            {
                onSuccess: () => {
                    handleMessage({
                        content: 'Xóa dữ liệu thành công',
                    });
                    onRefetch?.();
                },
                onError: (error: any) => {
                    handleMessage({
                        type: MessageType.ERROR,
                        content: error?.message || 'Lỗi xóa dữ liệu không thành công',
                    });
                },
            },
        );
    };

    const renderFieldValue = (column: any, record: any) => {
        const dataIndex = column.dataIndex as string;
        if (column.render) {
            return column.render(dataIndex ? record[dataIndex] : undefined, record, 0);
        }
        return dataIndex ? record[dataIndex] : undefined;
    };

    const displayColumns = columns.filter((col: any) => col.key !== 'action' && col.dataIndex);
    const hasActions = Boolean(actionItems?.length || resource);

    const firstColumn = displayColumns[0];
    const firstColumnValue = firstColumn ? renderFieldValue(firstColumn, record) : null;
    const restColumns = displayColumns.slice(1);

    const descriptionsItems = restColumns
        .map((column: any) => {
            const value = renderFieldValue(column, record);
            if (!value && value !== 0) return null;

            return {
                key: column.key || column.dataIndex,
                label: column.title as string,
                children: value,
            };
        })
        .filter((item): item is { key: any; label: string; children: any } => item !== null);

    return (
        <CustomCard
            hoverable
            size="small"
            className={`mb-3 transition-all duration-200 ${selected ? 'ring-2 ring-blue-400 shadow-md' : 'shadow-sm hover:shadow-md'}`}
            styles={{ body: { padding: 0 } }}
        >
            <div className="p-4">
                <CustomFlex gap={12} align="flex-start">
                    {onSelectChange && (
                        <div className="pt-1">
                            <CustomCheckbox
                                checked={selected}
                                disabled={disabled}
                                onChange={(e) => onSelectChange(record, e.target.checked)}
                            />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <CustomFlex gap={8} align="center" justify="space-between" className="mb-3">
                            {firstColumnValue && (
                                <div className="font-semibold text-lg text-gray-900 dark:text-gray-100 break-words leading-tight flex-1">
                                    {firstColumnValue}
                                </div>
                            )}

                            {hasActions && (
                                <CustomDropdown
                                    trigger={['click']}
                                    menu={{
                                        items: [
                                            ...(actionItems?.map((action) => ({
                                                key: action.key,
                                                label: action.label,
                                                icon: action.icon,
                                                onClick: () => action.onClick(record),
                                            })) || []),
                                            ...(onRefetch && resource
                                                ? [
                                                      {
                                                          type: 'divider' as const,
                                                      },
                                                      {
                                                          key: 'delete',
                                                          label: (
                                                              <CustomPopconfirm
                                                                  okType="danger"
                                                                  okText="Xóa"
                                                                  cancelText="Hủy"
                                                                  title="Xóa dữ liệu"
                                                                  description="Bạn có chắc chắn muốn xóa dữ liệu này không?"
                                                                  onConfirm={handleDelete}
                                                              >
                                                                  <span className="text-red-500">
                                                                      Xóa
                                                                  </span>
                                                              </CustomPopconfirm>
                                                          ),
                                                          icon: (
                                                              <DeleteOutlined className="text-red-500" />
                                                          ),
                                                          danger: true,
                                                      },
                                                  ]
                                                : []),
                                        ] as ItemType[],
                                    }}
                                >
                                    <CustomButton
                                        size="small"
                                        type="default"
                                        className="flex items-center justify-center min-w-[32px]"
                                        icon={
                                            <MoreOutlined
                                                style={{ fontSize: '18px', fontWeight: 'bold' }}
                                            />
                                        }
                                    />
                                </CustomDropdown>
                            )}
                        </CustomFlex>

                        {descriptionsItems.length > 0 && (
                            <CustomDescriptions
                                size="small"
                                column={1}
                                items={descriptionsItems}
                                styles={{
                                    label: {
                                        fontWeight: 500,
                                        width: '120px',
                                        paddingBottom: '8px',
                                    },
                                    content: {
                                        paddingBottom: '8px',
                                    },
                                }}
                            />
                        )}
                    </div>
                </CustomFlex>
            </div>
        </CustomCard>
    );
};
