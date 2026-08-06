'use client';

import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { DataTableContainer, FileGroups, MediaLightbox } from '@/components/common';
import { CustomButton, CustomSelect } from '@/components/custom';
import { DisplayMode } from '@/enums';
import { ActionTableItem, NDataProvider } from '@/interfaces';

import { columns, displayModeOptions, getFilterSearch } from './constants';
import { useScrapingDataPage } from './hooks';
import { ProcessScrapeData } from './components';

const ScrapingDataPage = () => {
    const {
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
        selectedDataProviderIds,
        setSelectedDataProviderIds,
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
        customFilterItems,
        handlePhotoClick,
    } = useScrapingDataPage();

    const actionItems: ActionTableItem[] = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record: NDataProvider.IScrapingData) => modalPropsData?.show?.(record?.id),
        },
    ];

    const actionButtons: ReactNode[] = [
        <CustomButton
            type="primary"
            key="scrape-data"
            title="Cào dữ liệu"
            icon={<Icon icon="lucide:file-text" />}
            onClick={() => setOpenProcessScrapeDataModal(true)}
        >
            Cào
        </CustomButton>,
        <CustomButton
            type="primary"
            key="slideshow"
            title="Trình chiếu"
            icon={<Icon icon="lucide:play" />}
            onClick={() => setIsLightboxOpen(true)}
        >
            Trình chiếu
        </CustomButton>,
        <CustomButton
            type="primary"
            key="delete-data"
            title="Xóa dữ liệu"
            icon={<Icon icon="lucide:trash" />}
            disabled={!selectedDataProviderIds?.length}
            onClick={() => handleDelete(selectedDataProviderIds)}
        >
            Xóa
        </CustomButton>,
    ];

    const customFilterActions: ReactNode = (
        <CustomSelect
            key="display-mode"
            value={displayMode}
            placeholder="Chế độ hiển thị"
            className="w-[120px] shrink-0 sm:w-[130px]"
            onChange={(value) => setDisplayMode(value as DisplayMode)}
            options={displayModeOptions}
        />
    );

    return (
        <>
            <DataTableContainer
                resource="scraping-data"
                actionItems={actionItems}
                title="Danh sách dữ liệu cào"
                description="Xem và quản lý dữ liệu đã được cào"
                actionButtons={actionButtons}
                customFilterItems={customFilterItems}
                tableContainerData={tableContainerData}
                columns={displayMode === DisplayMode.TABLE ? columns : undefined}
                filterSearch={getFilterSearch(displayMode)}
                childrenTop={
                    displayMode === DisplayMode.LIST && (
                        <FileGroups
                            data={photoItems}
                            displayMode={viewMode}
                            columns={columnDisplay}
                            onClickFile={handlePhotoClick}
                            onDeleteFile={(fileId: string) => handleDelete([fileId])}
                        />
                    )
                }
                onRowSelectionChange={(selectedRows: NDataProvider.IDataProvider[]) => {
                    const dataProviderIds = selectedRows?.map((item) => item.id ?? '');
                    setSelectedDataProviderIds(dataProviderIds ?? []);
                }}
                customFilterActions={customFilterActions}
            />

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
