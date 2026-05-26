'use client';

import {
    CustomButton,
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInputNumber,
    CustomRow,
} from '@/components/custom';
import { useSelectDataProviderItem, useSelectItem } from '@/hooks';
import { NDataProvider } from '@/interfaces';
import { Icon } from '@iconify/react';
import { JSX, useState } from 'react';
import { LinkOutlined } from '@ant-design/icons';
import { FORM_FIELDS } from './ScrapeSetting';
import { LocalFolderModal } from './LocalFolderModal';

type LocalScrapeFormProps = {
    url: string;
    dataProvider?: NDataProvider.IDataProvider;

    onRegistered: (response: NDataProvider.RegisterLocalFolderResponse) => void;
    renderFormUrl: (field: string, index?: number) => JSX.Element;
};

export const LocalScrapeForm = ({
    url,
    dataProvider,
    onRegistered,
    renderFormUrl,
}: LocalScrapeFormProps) => {
    const [openLocalFolderModal, setOpenLocalFolderModal] = useState(false);

    const { query: itemQuery } = useSelectItem({
        enabled: true,
    });
    const { query: dataProviderItemQuery } = useSelectDataProviderItem({
        id: dataProvider?.id,
        type: 'data-provider',
        enabled: !!dataProvider?.id,
    });

    const items = itemQuery?.data?.data ?? [];
    const providerItems = dataProviderItemQuery?.data?.data ?? [];
    const queryLoading = itemQuery?.isLoading || dataProviderItemQuery?.isLoading;

    const handleOpenLocalFolderModal = () => {
        setOpenLocalFolderModal(true);
    };

    const handleCloseLocalFolderModal = () => {
        setOpenLocalFolderModal(false);
    };

    const handleLocalFolderRegistered = (response: NDataProvider.RegisterLocalFolderResponse) => {
        dataProviderItemQuery?.refetch();
        onRegistered(response);
    };

    return (
        <>
            <CustomRow gutter={[16, 16]}>
                <CustomCol span={12}>
                    <CustomForm.Item
                        label="Thời gian delay giữa mỗi lần retry (ms)"
                        tooltip="Thời gian delay giữa mỗi lần retry (ms)"
                        name={['targetConfig', FORM_FIELDS.RETRY_DELAY]}
                    >
                        <CustomInputNumber
                            min={0}
                            placeholder="Thời gian delay giữa mỗi lần retry (ms)"
                        />
                    </CustomForm.Item>
                </CustomCol>

                <CustomCol span={12}>
                    <CustomForm.Item
                        label="Số lần thử lại khi có lỗi"
                        tooltip="Số lần thử lại khi có lỗi"
                        name={['targetConfig', FORM_FIELDS.RETRY_ATTEMPTS]}
                    >
                        <CustomInputNumber min={0} placeholder="Số lần thử lại khi có lỗi" />
                    </CustomForm.Item>
                </CustomCol>

                <CustomCol span={24}>
                    <CustomForm.Item
                        label="Số lượng kết quả tối đa"
                        tooltip="Số lượng kết quả tối đa"
                        name={['targetConfig', FORM_FIELDS.MAX_RESULTS]}
                    >
                        <CustomInputNumber min={0} placeholder="Số lượng kết quả tối đa" />
                    </CustomForm.Item>
                </CustomCol>

                <CustomCol span={24}>
                    <CustomFlex justify="space-between" align="end" gap={10}>
                        <CustomForm.Item
                            label="URL"
                            name={FORM_FIELDS.URL}
                            className="w-full max-w-[calc(100%-50px)]"
                        >
                            {renderFormUrl(FORM_FIELDS.URL)}
                        </CustomForm.Item>
                        <CustomButton
                            type="primary"
                            className="mb-2"
                            disabled={!url}
                            icon={<LinkOutlined />}
                            onClick={() => window.open(url, '_blank')}
                        />
                    </CustomFlex>
                </CustomCol>

                <CustomCol span={24}>
                    <CustomFlex justify="end" align="center">
                        <CustomButton
                            type="primary"
                            disabled={!dataProvider?.id || queryLoading}
                            icon={<Icon icon="lucide:folder-plus" />}
                            onClick={handleOpenLocalFolderModal}
                        >
                            Thêm thư mục
                        </CustomButton>
                    </CustomFlex>
                </CustomCol>
            </CustomRow>

            {dataProvider?.id && openLocalFolderModal && (
                <LocalFolderModal
                    open={openLocalFolderModal}
                    items={items}
                    queryLoading={queryLoading}
                    dataProvider={dataProvider}
                    providerItems={providerItems}
                    onClose={handleCloseLocalFolderModal}
                    onSuccess={handleLocalFolderRegistered}
                />
            )}
        </>
    );
};
