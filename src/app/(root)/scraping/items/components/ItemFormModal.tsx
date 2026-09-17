'use client';

import { CustomInputForm, CustomModalForm } from '@/components/common';
import type { UseCustomModalFormResponse } from '@/hooks';
import { FormRuleType } from '@/utilities';
import type { ItemFormValues, ItemRecord } from '@/app/(root)/scraping/items/types';

type ItemFormModalProps = {
    modalForm: UseCustomModalFormResponse<ItemRecord, ItemFormValues, ItemRecord>;
};

export const ItemFormModal = ({ modalForm }: ItemFormModalProps) => {
    const { mode } = modalForm;

    return (
        <CustomModalForm<ItemRecord, ItemFormValues, ItemRecord>
            width={600}
            modalForm={modalForm}
            title={mode === 'create' ? 'Thêm mới đối tượng' : 'Chỉnh sửa đối tượng'}
            createInitialValues={{
                name: '',
                code: '',
                tags: '',
            }}
        >
            <CustomInputForm
                name="name"
                label="Tên đối tượng"
                inputProps={{ placeholder: 'Nhập tên đối tượng' }}
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập tên đối tượng' },
                    {
                        type: FormRuleType.Max,
                        max: 255,
                        message: 'Tên đối tượng không được vượt quá 255 ký tự',
                    },
                ]}
            />

            <CustomInputForm
                name="code"
                label="Mã"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập mã đối tượng' },
                    {
                        type: FormRuleType.Max,
                        max: 20,
                        message: 'Mã đối tượng không được vượt quá 20 ký tự',
                    },
                ]}
                inputProps={{
                    disabled: mode === 'edit',
                    placeholder: 'Nhập mã đối tượng',
                }}
            />

            <CustomInputForm
                name="tags"
                label="Tags"
                rulesConfig={[
                    {
                        type: FormRuleType.Custom,
                        validator: (_: any, value: string) => {
                            if (
                                value &&
                                typeof value === 'string' &&
                                value
                                    .split(',')
                                    .some((tag) => tag.trim().length === 0 && tag !== '')
                            ) {
                                return Promise.reject(new Error('Tag không được bỏ trống!'));
                            }
                            return Promise.resolve();
                        },
                    },
                ]}
                inputProps={{
                    placeholder: 'Nhập các tag, cách nhau bằng dấu phẩy ","',
                }}
            />
        </CustomModalForm>
    );
};
