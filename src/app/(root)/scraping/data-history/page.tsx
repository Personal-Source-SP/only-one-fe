'use client';

import { CustomElement, TableContainer } from '@/components/custom';
import { DisplayScrapeStatus } from '@/components/module/data-provider';
import { PhotoGroups } from '@/components/module/photos';
import {
    CustomFilterType,
    DisplayMode,
    ElementType,
    QualityMode,
    ScrapeStatusEnum,
    ViewPhotoMode,
} from '@/enums';
import { useCustomModal, useTableContainer } from '@/hooks';
import { FilterItem, NDataProvider, PhotoItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Space, Switch } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useMemo, useState } from 'react';

const DataHistoryPage: FC = () => {
    const [isChecked, setIsChecked] = useState(false);
    const [quantityRefetch, setQuantityRefetch] = useState(0);

    const [columnDisplay, setColumnDisplay] = useState(4);
    const [viewMode, setViewMode] = useState<ViewPhotoMode>(ViewPhotoMode.ALL);
    const [qualityMode, setQualityMode] = useState<QualityMode>(QualityMode.LOW);
    const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.LIST);

    const tableContainerData = useTableContainer({
        resource: 'data-history',
    });

    const modalPropsData = useCustomModal({
        action: 'edit',
        resource: 'data-history',
    });

    const handlePhotoClick = (googleDriveFileId: string) => {
        const index = photoItems?.findIndex((photo) => photo.id === googleDriveFileId);
        if (index !== undefined) {
            // openLightbox(index);
        }
    };

    const photoItems: PhotoItem[] = useMemo(() => {
        const dataHistories = tableContainerData.tableQuery?.data?.data ?? [];
        if (!dataHistories?.length) return [];

        return dataHistories?.map((item) => ({
            id: item.id,
            url: item.url ?? '',
            mimeType: item.mimeType ?? '',
            lastModified: item.lastModified ?? new Date(),
            folderName: item.googleDriveFolder?.name ?? '',
        }));
    }, [tableContainerData.tableQuery?.data?.data, qualityMode]);

    const columns: ColumnsType<NDataProvider.IDataHistory> = [
        {
            title: 'Tên đối tượng',
            dataIndex: 'dataProviderItem',
            key: 'dataProviderItem',
            ellipsis: true,
            sorter: true,
            render: (dataProviderItem: NDataProvider.IDataProviderItem) =>
                dataProviderItem?.item?.name ?? '---',
        },
        {
            title: 'Ngày scrape',
            dataIndex: 'scrapeTimestamp',
            key: 'scrapeTimestamp',
            sorter: true,
            render: (scrapeTimestamp: Date) =>
                scrapeTimestamp ? dayjs(scrapeTimestamp).format('DD/MM/YYYY HH:mm:ss') : '---',
        },
        {
            key: 'status',
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: true,
            render: (status: ScrapeStatusEnum) => <DisplayScrapeStatus status={status} />,
        },
    ];

    const customFilterItems: FilterItem[] = [
        {
            span: 6,
            showSearch: true,
            allowClear: true,
            field: 'type',
            title: 'Loại dữ liệu',
            type: CustomFilterType.SELECT,
            options: [
                { label: 'Ảnh', value: 'image' },
                { label: 'Video', value: 'video' },
                { label: 'Tài liệu', value: 'document' },
            ],
        },
    ];

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Danh sách lịch sử dữ liệu"
                elementType={ElementType.TITLE}
                actions={[
                    <Space key="display-list" align="center">
                        <Switch checked={isChecked} onChange={(checked) => setIsChecked(checked)} />
                        <span>Hiển thị dạng danh sách</span>
                    </Space>,
                ]}
            />

            <TableContainer
                resource="data-history"
                quantityRefetch={quantityRefetch}
                customFilterItems={customFilterItems}
                tableContainerData={tableContainerData}
                columns={displayMode === DisplayMode.TABLE ? columns : undefined}
                actionItems={[
                    {
                        key: 'edit',
                        label: 'Chỉnh sửa',
                        icon: <Icon icon="lucide:edit" />,
                        onClick: (record) => modalPropsData?.show?.(record?.id),
                    },
                ]}
                filterSearch={{
                    span: 18,
                    placeholder: 'Tìm kiếm lịch sử dữ liệu',
                }}
                childrenTop={
                    <PhotoGroups
                        data={photoItems}
                        displayMode={viewMode}
                        columns={columnDisplay}
                        onPhotoClick={handlePhotoClick}
                    />
                }
            />
        </Space>
    );
};

export default DataHistoryPage;
