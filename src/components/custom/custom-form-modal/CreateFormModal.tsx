'use client';

import CustomModal from '@/components/custom/custom-modal';
import { useMainContext } from '@/contexts/MainContext';
import { useCustomModal } from '@/hooks';

import { FormFieldItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button, Col, Flex, Form, FormProps, Input, Row, Select, Space, Spin, Switch } from 'antd';
import { FC, memo, ReactNode, useCallback, useEffect } from 'react';

type CreateFormModalProps = {
    open: boolean;
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

export const renderFormFields = (formField: FormFieldItem, formProps: FormProps<any>) => {
    let formFieldElement = null;

    switch (formField.type) {
        case 'input': {
            formFieldElement = (
                <Input
                    addonAfter={formField.addonAfter}
                    addonBefore={formField.addonBefore}
                    placeholder={formField.placeholder}
                    disabled={formField.disabled ?? false}
                    onChange={(e) => formField.onChange?.(e.target.value, formProps?.form)}
                />
            );
            break;
        }

        case 'select': {
            formFieldElement = (
                <Select
                    options={formField.options ?? []}
                    placeholder={formField.placeholder}
                    disabled={formField.disabled ?? false}
                    allowClear={formField.allowClear ?? true}
                    showSearch={formField.showSearch ?? true}
                    onChange={(value) => formField.onChange?.(value, formProps?.form)}
                />
            );
            break;
        }

        case 'textarea': {
            formFieldElement = (
                <Input.TextArea
                    rows={formField.rows ?? 4}
                    placeholder={formField.placeholder}
                    disabled={formField.disabled ?? false}
                    onChange={(e) => formField.onChange?.(e.target.value, formProps?.form)}
                />
            );
            break;
        }

        case 'switch': {
            formFieldElement = (
                <Switch
                    disabled={formField.disabled ?? false}
                    onChange={(value) => formField.onChange?.(value, formProps?.form)}
                />
            );
            break;
        }

        default:
            return <></>;
    }

    return (
        <Col span={formField.span ?? 24} key={formField.name} hidden={formField.hidden ?? false}>
            {formField.elementTopRender && formField.elementTopRender}
            <Form.Item
                name={formField.name}
                rules={formField.rules}
                label={formField.label}
                tooltip={formField.tooltip}
            >
                {formFieldElement}
            </Form.Item>
            {formField.elementBottomRender && formField.elementBottomRender}
        </Col>
    );
};

const CreateFormModal: FC<CreateFormModalProps> = ({
    open,
    resource,
    formFields,
    title,
    width,
    topRender,
    bottomRender,
    initialValues,
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
            <Form
                {...formProps}
                layout="vertical"
                initialValues={initialValues}
                className="[&_.ant-form-item]:!mb-2"
                onFinish={(values) => {
                    const request = onTransformValues?.(values) ?? values;
                    formProps?.onFinish?.(request);
                }}
            >
                <Spin spinning={formLoading}>
                    <Space direction="vertical" className="w-full h-full overflow-x-hidden">
                        {topRender && topRender}
                        <Row gutter={[8, 8]}>
                            {formFields.map((formField) => renderFormFields(formField, formProps))}
                        </Row>
                        {bottomRender && bottomRender}
                    </Space>
                </Spin>
            </Form>
        </CustomModal>
    );
};

export default memo(CreateFormModal);
