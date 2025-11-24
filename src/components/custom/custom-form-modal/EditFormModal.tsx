'use client';

import CustomModal from '@/components/custom/custom-modal';

import { renderFormFields } from '@/components/custom/custom-form-modal/CreateFormModal';
import { useMainContext } from '@/contexts/MainContext';
import { useCustomModal } from '@/hooks';
import { FormFieldItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button, Flex, Form, Row, Space, Spin } from 'antd';
import { ReactNode, useCallback, useEffect } from 'react';

type EditFormModalProps = {
    id: string;
    resource: string;
    formFields: FormFieldItem[];
    title?: string;
    width?: number;
    topRender?: ReactNode;
    bottomRender?: ReactNode;
    initialValues?: Record<string, any>;
    onClose?: () => void;
    onTransformValues?: (values: any) => Record<string, any>;
};

const EditFormModal = ({
    id,
    resource,
    formFields,
    title,
    width,
    topRender,
    bottomRender,
    initialValues,
    onClose,
    onTransformValues,
}: EditFormModalProps) => {
    const { handleMessage } = useMainContext();

    const modalPropsData = useCustomModal({
        action: 'edit',
        resource: resource,
        onMutationSuccess: (data) => {
            if (!data?.data?.data) {
                handleMessage({
                    type: 'error',
                    content: 'Chỉnh sửa thất bại',
                });
            }

            handleMessage({
                content: 'Chỉnh sửa thành công',
            });

            close();
            onClose?.();
        },
        onMutationError: (error) => {
            handleMessage({
                type: 'error',
                content: error.message || 'Chỉnh sửa thất bại',
            });
        },
    });

    const { show, close, formProps, modalProps, formLoading } = modalPropsData;

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
                    onClose?.();
                },
            }}
        >
            <Spin spinning={formLoading}>
                <Space direction="vertical" className="w-full h-full overflow-x-hidden">
                    {topRender && topRender}

                    <Form
                        {...formProps}
                        layout="vertical"
                        className="[&_.ant-form-item]:!mb-2"
                        initialValues={initialValues ?? formProps?.initialValues}
                        onFinish={(values) => {
                            const request = onTransformValues?.(values) ?? values;
                            formProps?.onFinish?.(request);
                        }}
                    >
                        <Row gutter={[8, 8]}>
                            {formFields.map((formField) => renderFormFields(formField, formProps))}
                        </Row>
                    </Form>

                    {bottomRender && bottomRender}
                </Space>
            </Spin>
        </CustomModal>
    );
};

export default EditFormModal;
