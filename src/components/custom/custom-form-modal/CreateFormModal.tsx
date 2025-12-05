'use client';

import CustomModal from '@/components/custom/custom-modal';
import CodeDisplay from '@/components/module/code-display';

import { useMainContext } from '@/contexts/MainContext';
import { useCustomModal } from '@/hooks';

import { FormFieldItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useApiUrl } from '@refinedev/core';
import {
    Button,
    Col,
    Flex,
    Form,
    FormProps,
    Input,
    Row,
    Select,
    Space,
    Spin,
    Switch,
    Upload,
    UploadFile,
} from 'antd';
import { useSession } from 'next-auth/react';
import React, { ChangeEvent, ReactNode, useCallback, useEffect } from 'react';

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
    const formItemProps: Record<string, any> = {
        name: formField.name,
        rules: formField.rules,
        tooltip: formField.tooltip,
    };

    if (formField.type !== 'switch') {
        formItemProps.label = formField.label;
    }

    switch (formField.type) {
        case 'input': {
            const { placeholder, addonAfter, addonBefore } = formField.inputProps ?? {};
            formFieldElement = (
                <Input
                    addonAfter={addonAfter}
                    addonBefore={addonBefore}
                    placeholder={placeholder}
                    disabled={formField.disabled ?? false}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        formField.onChange?.(e.target.value, formProps?.form)
                    }
                />
            );
            break;
        }

        case 'select': {
            const { placeholder, options, allowClear, showSearch } = formField.selectProps ?? {};
            formFieldElement = (
                <Select
                    options={options ?? []}
                    placeholder={placeholder}
                    disabled={formField.disabled ?? false}
                    allowClear={allowClear ?? true}
                    showSearch={showSearch ?? true}
                    onChange={(value) => formField.onChange?.(value, formProps?.form)}
                />
            );
            break;
        }

        case 'textarea': {
            const { placeholder, rows } = formField.textareaProps ?? {};
            formFieldElement = (
                <Input.TextArea
                    showCount
                    allowClear
                    rows={rows ?? 4}
                    placeholder={placeholder}
                    disabled={formField.disabled ?? false}
                    onClear={() => formField.onChange?.('', formProps?.form)}
                    count={formProps?.form?.getFieldValue(formField.name)?.length ?? 0}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        formField.onChange?.(e.target.value, formProps?.form)
                    }
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

        case 'code-display': {
            formFieldElement = <CodeDisplay code="" {...(formField.codeProps ?? {})} />;
            Object.assign(formItemProps, {
                valuePropName: 'code',
                trigger: 'onCodeChange',
                getValueProps: (value: string) => {
                    if (!value) return { code: '{}' };
                    if (typeof value === 'string') return { code: value };

                    try {
                        return { code: JSON.stringify(value, null, 2) };
                    } catch {
                        return { code: String(value) };
                    }
                },
                getValueFromEvent: (value: string) => {
                    formField.onChange?.(value, formProps?.form);
                    return value ?? '';
                },
            });
            break;
        }

        case 'upload': {
            const { accept, maxCount, multiple } = formField.uploadProps ?? {};
            formFieldElement = (
                <Upload.Dragger
                    accept={accept}
                    maxCount={maxCount ?? 1}
                    beforeUpload={() => false}
                    multiple={multiple ?? false}
                    disabled={formField.disabled ?? false}
                >
                    <Space size="small" direction="vertical" align="center">
                        <p className="ant-upload-drag-icon">
                            <Icon icon="lucide:upload" style={{ fontSize: '48px' }} />
                        </p>
                        <p className="ant-upload-text font-medium text-lg mt-4">
                            Kéo thả hoặc click để chọn file
                        </p>
                        <p className="ant-upload-hint text-gray-500">
                            {accept ? `Định dạng hỗ trợ: ${accept}` : 'Chọn file để tải lên'}
                        </p>
                    </Space>
                </Upload.Dragger>
            );
            Object.assign(formItemProps, {
                valuePropName: 'fileList',
                getValueFromEvent: (e: { fileList: UploadFile[] }) => {
                    formField.onChange?.(e.fileList, formProps?.form);
                    return e.fileList;
                },
            });
            break;
        }

        default:
            return <></>;
    }

    return (
        <Col span={formField.span ?? 24} key={formField.name} hidden={formField.hidden ?? false}>
            {formField.elementTopRender && formField.elementTopRender}

            {formField.type === 'switch' ? (
                <Flex align="center" justify="space-between">
                    <div>
                        <p className="font-medium !my-0">{formField.label}</p>
                        <p className="text-sm text-gray-500 !my-0">
                            {formField.switchProps?.placeholder}
                        </p>
                    </div>
                    <Form.Item {...formItemProps}>{formFieldElement}</Form.Item>
                </Flex>
            ) : (
                <Form.Item {...formItemProps}>{formFieldElement}</Form.Item>
            )}

            {formField.elementBottomRender && formField.elementBottomRender}
        </Col>
    );
};

const CreateFormModal = ({
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
}: CreateFormModalProps) => {
    const { handleMessage } = useMainContext();
    const apiUrl = useApiUrl();
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

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
                    loading={formLoading || isSubmitting}
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
            <Spin spinning={formLoading || isSubmitting}>
                <Space direction="vertical" className="w-full h-full overflow-x-hidden">
                    {topRender && topRender}

                    <Form
                        {...formProps}
                        layout="vertical"
                        initialValues={initialValues}
                        className="[&_.ant-form-item]:!mb-2"
                        onFinish={async (values) => {
                            const transformed = onTransformValues?.(values) ?? values;

                            if (transformed instanceof FormData) {
                                setIsSubmitting(true);
                                try {
                                    const token = session?.user?.accessToken;
                                    const headers: HeadersInit = {};

                                    if (token) {
                                        headers['Authorization'] = `Bearer ${token}`;
                                    }

                                    const response = await fetch(`${apiUrl}/${resource}`, {
                                        method: 'POST',
                                        headers,
                                        body: transformed,
                                    });

                                    const data = await response.json();

                                    if (response.ok && data?.data) {
                                        handleMessage({
                                            content: 'Tạo thành công',
                                        });
                                        close();
                                        onClose?.();
                                    } else {
                                        handleMessage({
                                            type: 'error',
                                            content: data?.errorMessage || 'Tạo thất bại',
                                        });
                                    }
                                } catch (error: any) {
                                    handleMessage({
                                        type: 'error',
                                        content: error?.message || 'Tạo thất bại',
                                    });
                                } finally {
                                    setIsSubmitting(false);
                                }
                            } else {
                                formProps?.onFinish?.(transformed);
                            }
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

export default CreateFormModal;
