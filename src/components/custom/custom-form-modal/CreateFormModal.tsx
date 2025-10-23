'use client';

import CustomModal from '@/components/custom/custom-modal';

import { FormFieldItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useModalForm } from '@refinedev/antd';
import { HttpError } from '@refinedev/core';
import { Button, Col, Flex, Form, Input, message, Row, Select, Space, Spin } from 'antd';
import { FC, memo, useCallback, useEffect } from 'react';

type CreateFormModalProps = {
    open: boolean;
    resource: string;
    formFields: FormFieldItem[];
    title?: string;
    width?: number;
    onClose: () => void;
};

export const renderFormFields = (formField: FormFieldItem) => {
    switch (formField.type) {
        case 'input':
            return (
                <Col span={formField.span ?? 24}>
                    {formField.elementTopRender && formField.elementTopRender}
                    <Form.Item
                        name={formField.name}
                        rules={formField.rules}
                        label={formField.label}
                    >
                        <Input
                            onChange={formField.onChange}
                            placeholder={formField.placeholder}
                            defaultValue={formField.defaultValue}
                            disabled={formField.disabled ?? false}
                        />
                    </Form.Item>
                    {formField.elementBottomRender && formField.elementBottomRender}
                </Col>
            );

        case 'select':
            return (
                <Col span={formField.span ?? 24}>
                    {formField.elementTopRender && formField.elementTopRender}
                    <Form.Item
                        name={formField.name}
                        label={formField.label}
                        rules={formField.rules}
                    >
                        <Select
                            onChange={formField.onChange}
                            options={formField.options ?? []}
                            placeholder={formField.placeholder}
                            defaultValue={formField.defaultValue}
                            disabled={formField.disabled ?? false}
                            allowClear={formField.allowClear ?? true}
                            showSearch={formField.showSearch ?? true}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                    {formField.elementBottomRender && formField.elementBottomRender}
                </Col>
            );

        case 'textarea':
            return (
                <Col span={formField.span ?? 24}>
                    {formField.elementTopRender && formField.elementTopRender}
                    <Form.Item
                        name={formField.name}
                        label={formField.label}
                        rules={formField.rules}
                    >
                        <Input.TextArea
                            rows={formField.rows ?? 4}
                            onChange={formField.onChange}
                            placeholder={formField.placeholder}
                            defaultValue={formField.defaultValue}
                            disabled={formField.disabled ?? false}
                        />
                    </Form.Item>
                    {formField.elementBottomRender && formField.elementBottomRender}
                </Col>
            );

        default:
            return <></>;
    }
};

const CreateFormModal: FC<CreateFormModalProps> = ({
    open,
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
        action: 'create',
        resource: resource,
        autoResetForm: true,
        errorNotification: false,
        successNotification: false,
        warnWhenUnsavedChanges: false,
        onMutationSuccess: (data) => {
            if (!data?.data?.data) {
                message.error('Tạo thất bại');
            }

            message.success('Tạo thành công');

            close();
            onClose();
        },
        onMutationError: (error) => {
            message.error(error.message || 'Tạo thất bại');
        },
    });

    useEffect(() => {
        if (open) {
            show();
        } else {
            close();
        }
    }, [open, show, close]);

    const renderFooter = useCallback(() => {
        return (
            <Flex align="center" justify="end" className="w-full" gap={16}>
                <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full"
                    loading={formLoading}
                    icon={<Icon icon="lucide:plus" />}
                    onClick={() => formProps.form?.submit()}
                >
                    <span>Tạo mới</span>
                </Button>
            </Flex>
        );
    }, [formProps, formLoading]);

    return (
        <CustomModal
            modalProps={{
                ...modalProps,
                open,
                centered: true,
                closable: true,
                width: width ?? 720,
                title: title ?? 'Tạo mới',
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

export default memo(CreateFormModal);
