'use client';

import { CustomAlertType } from '@/interfaces';
import { Alert, AlertProps } from 'antd';

type CustomAlertProps = {
    description?: string;
    title: string;
    type?: CustomAlertType;
} & Pick<AlertProps, 'className' | 'showIcon'>;

export const CustomAlert = ({
    title,
    description,
    type = 'info',
    className,
    showIcon = true,
}: CustomAlertProps) => {
    const typeClassName =
        type === 'success'
            ? '!border-green-200 !bg-green-50 [&_.ant-alert-message]:!text-green-800'
            : '!border-hub-border !bg-hub-active [&_.ant-alert-message]:!text-hub-text';

    return (
        <section className="mb-4 mt-2">
            <Alert
                showIcon={showIcon}
                type={type}
                message={title}
                description={description}
                className={[typeClassName, 'flex !items-center !py-3', className]
                    .filter(Boolean)
                    .join(' ')}
            />
        </section>
    );
};
