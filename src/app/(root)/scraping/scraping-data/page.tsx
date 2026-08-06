'use client';

import { useMemo } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { FileGroups, MediaLightbox } from '@/components/common';
import { CustomButton, CustomSelect } from '@/components/custom';
import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type IFilterField,
} from '@/components/custom-container';
import { DisplayMode } from '@/enums';

import { columns, displayModeOptions } from './constants';
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

    const actions = useMemo<CardAction[]>(
        () => [
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
                        onChange={(value) => setDisplayMode(value as DisplayMode)}
                        options={displayModeOptions}
                    />
                ),
            },
        ],
        [displayMode, setDisplayMode, setOpenProcessScrapeDataModal, setIsLightboxOpen],
    );

    const filters = useMemo<IFilterField[]>(
        () => [
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
        ],
        [tableContainerData],
    );

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
                        deleteResource="scraping-data"
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
