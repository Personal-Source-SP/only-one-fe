'use client';

import { useMainContext } from '@/contexts/MainContext';
import { MessageType } from '@/enums';
import { useCustomModal } from '@/hooks';
import { FormFieldItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useApiUrl } from '@refinedev/core';
import {
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomRow,
    CustomSpace,
    CustomSpin,
} from '@/components/custom';
import { useSession } from 'next-auth/react';
import { ReactNode, useCallback, useEffect, useState } from 'react';

import { renderFormFields } from './FormFields';
import { FormModalLayout } from './FormModalLayout';

type CreateFormDialogProps = {
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

export const CreateFormDialog = ({
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
}: CreateFormDialogProps) => {
    const apiUrl = useApiUrl();

    const { data: session } = useSession();
    const { handleMessage } = useMainContext();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { show, close, formProps, modalProps, formLoading } = useCustomModal({
        resource: resource,
        onMutationSuccess: (data) => {
            if (!data?.data?.data) {
                handleMessage({
                    type: MessageType.ERROR,
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
                type: MessageType.ERROR,
                content: error.message || 'Tạo thất bại',
            });
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
            <CustomFlex align="center" justify="end" className="w-full" gap={16}>
                <CustomButton
                    type="primary"
                    htmlType="submit"
                    className="!w-auto min-w-[7rem]"
                    icon={<Icon icon="lucide:plus" />}
                    loading={formLoading || isSubmitting}
                    onClick={() => formProps.form?.submit()}
                >
                    <span>Tạo mới</span>
                </CustomButton>
            </CustomFlex>
        );
    }, [formProps, formLoading, isSubmitting]);

    return (
        <FormModalLayout
            formLoading={formLoading || isSubmitting}
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
            <CustomSpin spinning={formLoading || isSubmitting}>
                <CustomSpace direction="vertical" className="w-full h-full overflow-x-hidden">
                    {topRender && topRender}

                    <CustomForm
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
                                    const headers: Record<string, string> = {};

                                    if (token) {
                                        headers.Authorization = `Bearer ${token}`;
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
                                            type: MessageType.ERROR,
                                            content: data?.errorMessage || 'Tạo thất bại',
                                        });
                                    }
                                } catch (error: any) {
                                    handleMessage({
                                        type: MessageType.ERROR,
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
                        <CustomRow gutter={[8, 8]}>
                            {formFields.map((formField) => renderFormFields(formField, formProps))}
                        </CustomRow>
                    </CustomForm>

                    {bottomRender && bottomRender}
                </CustomSpace>
            </CustomSpin>
        </FormModalLayout>
    );
};
