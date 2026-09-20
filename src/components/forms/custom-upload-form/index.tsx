'use client';

import { type ReactNode, useMemo, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';

import {
    CustomForm,
    CustomModal,
    CustomUpload,
    type FormItemProps,
    type UploadFile,
    type UploadProps,
} from '@/components';
import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomUploadFormProps = {
    label?: ReactNode;
    name: FormItemProps['name'];
    rulesConfig?: FormRuleConfig[];
    uploadProps?: UploadProps;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomUploadForm = ({
    label,
    name,
    rulesConfig,
    uploadProps,
    formItemProps,
}: CustomUploadFormProps) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    const handlePreview = async (file: UploadFile) => {
        setPreviewImage(file.url || (file.thumbUrl as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url?.substring(file.url.lastIndexOf('/') + 1) || '');
    };

    const normFile = (e: unknown) => {
        if (Array.isArray(e)) return e;
        return (e as { fileList?: UploadFile[] })?.fileList;
    };

    return (
        <>
            <CustomForm.Item
                {...formItemProps}
                label={label}
                name={name}
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={formRules}
            >
                <CustomUpload listType="picture-card" onPreview={handlePreview} {...uploadProps}>
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                </CustomUpload>
            </CustomForm.Item>
            <CustomModal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
            >
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </CustomModal>
        </>
    );
};
