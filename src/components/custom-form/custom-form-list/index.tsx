'use client';

import { PlusOutlined } from '@ant-design/icons';
import {
    CustomButton,
    CustomForm,
    type FormItemProps,
    type FormListFieldData,
    type FormListOperation,
} from '@/components/custom';
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
                            type="dashed"
                            onClick={() => operation.add()}
                            block
                            icon={<PlusOutlined />}
                        >
                            {addText}
                        </CustomButton>
                    </CustomForm.Item>
                </>
            )}
        </CustomForm.List>
    );
};
