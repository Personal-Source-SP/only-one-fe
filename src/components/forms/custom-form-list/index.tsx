'use client';

import {
    CustomButton,
    CustomForm,
    type FormItemProps,
    type FormListFieldData,
    type FormListOperation,
} from '@/components';
import { PlusOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

export type CustomFormListProps = {
    name: FormItemProps['name'];
    addText?: string;
    children: (
        fields: FormListFieldData[],
        operation: FormListOperation,
        meta: { errors: ReactNode[] },
    ) => ReactNode;
};

export const CustomFormList = ({
    name,
    addText = 'Thêm mục mới',
    children,
}: CustomFormListProps) => {
    return (
        <CustomForm.List name={name}>
            {(fields, operation, meta) => (
                <>
                    {children(fields, operation, meta)}
                    <CustomForm.Item>
                        <CustomButton
                            block
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => operation.add()}
                        >
                            {addText}
                        </CustomButton>
                    </CustomForm.Item>
                </>
            )}
        </CustomForm.List>
    );
};
