'use client';

import Link from 'next/link';
import { PlusOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import {
    FileGroups,
    FilterPanel,
    ListTable,
    ListWrapper,
    MediaLightbox,
    type CardAction,
    type IFilterField,
} from '@/components/common';
import { ColumnsType, CustomButton, CustomFlex, CustomSelect } from '@/components/custom-antd';
import { DisplayMode } from '@/enums';
import { formatDate } from '@/libs';
import { RESOURCE } from '@/config';

import type { IItem } from '@/app/(root)/scraping/items/types';
import { useScrapingDataPage } from './hooks';
import { ProcessScrapeData } from './components';
import type { ScrapingDataRecord } from './types';

const ScrapingDataPage = () => {
    const {
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
        columnDisplay,
        viewMode,
        displayMode,
        setDisplayMode,
        isLightboxOpen,
        setIsLightboxOpen,
        currentPhotoIndex,
        tableContainerData,
        handleDelete,
        modalPropsData,
        photoItems,
        handlePhotoClick,
    } = useScrapingDataPage();

    const columns: ColumnsType<ScrapingDataRecord> = [
        {
            title: 'Đối tượng',
            dataIndex: 'item',
            key: 'item',
            ellipsis: true,
            width: '25%',
            render: (item: IItem) => item?.name ?? '---',
        },
        {
            title: 'ID dữ liệu',
            dataIndex: 'dataId',
            key: 'dataId',
            ellipsis: true,
            sorter: true,
            width: '20%',
            render: (dataId: string) => dataId ?? '---',
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            sorter: true,
            width: '20%',
            render: (type: string) => type ?? '---',
        },
        {
            title: 'Ngày sửa đổi',
            dataIndex: 'lastModified',
            key: 'lastModified',
            sorter: true,
            width: '20%',
            render: (lastModified: Date) => formatDate(lastModified),
        },
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
            sorter: true,
            width: '15%',
            align: 'center',
            render: (url: string) =>
                url ? (
                    <CustomFlex align="center" justify="center">
                        <Link href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt="Xem" className="!h-20" />
                        </Link>
                    </CustomFlex>
                ) : (
                    '---'
                ),
        },
    ];

    const displayModeOptions = [
        {
            value: DisplayMode.LIST,
            label: (
                <span className="flex items-center gap-2">
                    <Icon icon="lucide:list" className="shrink-0 text-base" />
                    Danh sách
                </span>
            ),
        },
        {
            value: DisplayMode.TABLE,
            label: (
                <span className="flex items-center gap-2">
                    <Icon icon="lucide:table" className="shrink-0 text-base" />
                    Bảng
                </span>
            ),
        },
    ];

    const actions: CardAction[] = [
        {
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setOpenProcessScrapeDataModal(true)}
                >
                    Cào dữ liệu
                </CustomButton>
            ),
        },
        {
            component: (
                <CustomButton type="primary" onClick={() => setIsLightboxOpen(true)}>
                    Trình chiếu
                </CustomButton>
            ),
        },
        {
            component: (
                <CustomSelect
                    value={displayMode}
                    className="w-[130px]"
                    onChange={(value: any) => setDisplayMode(value as DisplayMode)}
                    options={displayModeOptions}
                />
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            placeholder: 'Tìm kiếm dữ liệu cào...',
            onChange: (value) => {
                tableContainerData.setCurrentPage(1);
                tableContainerData.setFilters([
                    {
                        field: 'dataId',
                        operator: 'contains',
                        value: value?.toString() ?? '',
                    },
                ]);
            },
        },
    ];

    return (
        <>
            <ListWrapper
                actions={actions}
                error={tableContainerData?.tableQuery?.error}
                isLoading={tableContainerData?.tableQuery?.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                {displayMode === DisplayMode.TABLE ? (
                    <ListTable<ScrapingDataRecord>
                        columns={columns}
                        tableProps={tableContainerData.tableProps as any}
                        tableQuery={tableContainerData.tableQuery as any}
                        deleteResource={RESOURCE.SCRAPING_DATA}
                        onEdit={(record) => modalPropsData?.show?.(record.id)}
                    />
                ) : (
                    <FileGroups
                        data={photoItems}
                        displayMode={viewMode}
                        columns={columnDisplay}
                        onClickFile={handlePhotoClick}
                        onDeleteFile={(fileId: string) => handleDelete([fileId])}
                    />
                )}
            </ListWrapper>

            <MediaLightbox
                isOpen={isLightboxOpen}
                index={currentPhotoIndex}
                closeLightbox={() => setIsLightboxOpen(false)}
                slides={(photoItems || [])?.map((p) => ({ src: p.url }))}
            />

            {openProcessScrapeDataModal && (
                <ProcessScrapeData
                    key="process-scrape-data"
                    open={openProcessScrapeDataModal}
                    onClose={() => {
                        setOpenProcessScrapeDataModal(false);
                        tableContainerData?.tableQuery?.refetch();
                    }}
                />
            )}
        </>
    );
};

export default ScrapingDataPage;
