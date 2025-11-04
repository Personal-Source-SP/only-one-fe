'use client';

import CustomModal from '@/components/custom/custom-modal';
import { useMainContext } from '@/contexts/MainContext';
import { useCustomModal } from '@/hooks';

import { FormFieldItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button, Col, Flex, Form, FormProps, Input, Row, Select, Space, Spin } from 'antd';
import { FC, memo, useCallback, useEffect } from 'react';

type CreateFormModalProps = {
    open: boolean;
    resource: string;
    formFields: FormFieldItem[];
    title?: string;
    width?: number;
    onClose?: () => void;
    onTransformValues?: (values: any) => Record<string, any>;
};

export const renderFormFields = (formField: FormFieldItem, formProps: FormProps<any>) => {
    switch (formField.type) {
        case 'input':
            return (
                <Col span={formField.span ?? 24} key={formField.name}>
                    {formField.elementTopRender && formField.elementTopRender}
                    <Form.Item
                        name={formField.name}
                        rules={formField.rules}
                        label={formField.label}
                        tooltip={formField.tooltip}
                    >
                        <Input
                            addonAfter={formField.addonAfter}
                            addonBefore={formField.addonBefore}
                            placeholder={formField.placeholder}
                            defaultValue={formField.defaultValue}
                            disabled={formField.disabled ?? false}
                            onChange={(e) => formField.onChange?.(e.target.value, formProps?.form)}
                        />
                    </Form.Item>
                    {formField.elementBottomRender && formField.elementBottomRender}
                </Col>
            );

        case 'select':
            return (
                <Col span={formField.span ?? 24} key={formField.name}>
                    {formField.elementTopRender && formField.elementTopRender}
                    <Form.Item
                        name={formField.name}
                        label={formField.label}
                        rules={formField.rules}
                        tooltip={formField.tooltip}
                    >
                        <Select
                            options={formField.options ?? []}
                            placeholder={formField.placeholder}
                            defaultValue={formField.defaultValue}
                            disabled={formField.disabled ?? false}
                            allowClear={formField.allowClear ?? true}
                            showSearch={formField.showSearch ?? true}
                            onChange={(value) => formField.onChange?.(value, formProps?.form)}
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
                <Col span={formField.span ?? 24} key={formField.name}>
                    {formField.elementTopRender && formField.elementTopRender}
                    <Form.Item
                        name={formField.name}
                        label={formField.label}
                        rules={formField.rules}
                        tooltip={formField.tooltip}
                    >
                        <Input.TextArea
                            rows={formField.rows ?? 4}
                            placeholder={formField.placeholder}
                            defaultValue={formField.defaultValue}
                            disabled={formField.disabled ?? false}
                            onChange={(e) => formField.onChange?.(e.target.value, formProps?.form)}
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
    onTransformValues,
}) => {
    const { handleMessage } = useMainContext();

    const modalPropsData = useCustomModal({
        resource: resource,
        onMutationSuccess: (data) => {
            if (!data?.data?.data) {
                handleMessage({
                    type: 'error',
                    content: 'Tạo thất bại',
                });
            }

            handleMessage({
                content: 'Tạo thành công',
            });

            close();
            onClose?.();
        },
        onMutationError: (error) => {
            handleMessage({
                type: 'error',
                content: error.message || 'Tạo thất bại',
            });
        },
    });

    const { show, close, formProps, modalProps, formLoading } = modalPropsData;

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
                    onClose?.();
                },
            }}
        >
            <Spin spinning={formLoading}>
                <Space direction="vertical" className="w-full h-full px-3 overflow-x-hidden">
                    <Form
                        {...formProps}
                        layout="vertical"
                        className="[&_.ant-form-item]:!mb-2"
                        onFinish={(values) => {
                            const request = onTransformValues?.(values) ?? values;
                            formProps?.onFinish?.(request);
                        }}
                    >
                        <Row gutter={[8, 8]}>
                            {formFields.map((formField) => renderFormFields(formField, formProps))}
                        </Row>
                    </Form>
                </Space>
            </Spin>
        </CustomModal>
    );
};

export default memo(CreateFormModal);
