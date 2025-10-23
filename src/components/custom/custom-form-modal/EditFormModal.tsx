'use client';

import CustomModal from '@/components/custom/custom-modal';

import { renderFormFields } from '@/components/custom/custom-form-modal/CreateFormModal';
import { FormFieldItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useModalForm } from '@refinedev/antd';
import { HttpError } from '@refinedev/core';
import { Button, Flex, Form, message, Row, Space, Spin } from 'antd';
import { FC, memo, useCallback, useEffect } from 'react';

type EditFormModalProps = {
    id: string;
    resource: string;
    formFields: FormFieldItem[];
    title?: string;
    width?: number;
    onClose: () => void;
};

const EditFormModal: FC<EditFormModalProps> = ({
    id,
    resource,
    formFields,
    title,
    width,
    onClose,
}) => {
    const { show, close, formProps, modalProps, formLoading } = useModalForm<
        any,
        HttpError,
        Partial<any>
    >({
        action: 'edit',
        resource: resource,
        autoResetForm: true,
        warnWhenUnsavedChanges: true,
        onMutationSuccess: (data) => {
            if (!data?.data?.data) {
                message.error('Chỉnh sửa thất bại');
            }

            message.success('Chỉnh sửa thành công');

            close();
            onClose();
        },
        onMutationError: (error) => {
            message.error(error.message || 'Chỉnh sửa thất bại');
        },
    });

    useEffect(() => {
        if (id) {
            show(id);
        } else {
            close();
        }
    }, [id, show, close]);

    const renderFooter = useCallback(() => {
        return (
            <Flex align="center" justify="end" className="w-full" gap={16}>
                <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full"
                    loading={formLoading}
                    icon={<Icon icon="lucide:pencil" />}
                    onClick={() => formProps.form?.submit()}
                >
                    <span>Cập nhật</span>
                </Button>
            </Flex>
        );
    }, [formProps, formLoading]);

    return (
        <CustomModal
            modalProps={{
                ...modalProps,
                centered: true,
                closable: true,
                open: Boolean(id),
                width: width ?? 720,
                title: title ?? 'Chỉnh sửa',
                footer: renderFooter(),
                onCancel: () => {
                    close();
                    onClose();
                },
            }}
        >
            <Spin spinning={formLoading}>
                <Space direction="vertical" className="w-full h-full px-3 overflow-x-hidden">
                    <Form {...formProps} layout="vertical" className="[&_.ant-form-item]:!mb-2">
                        <Row gutter={[8, 8]}>
                            {formFields.map((formField) => renderFormFields(formField))}
                        </Row>
                    </Form>
                </Space>
            </Spin>
        </CustomModal>
    );
};

export default memo(EditFormModal);
