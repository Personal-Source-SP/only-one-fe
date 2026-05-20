'use client';

import { CUSTOM_ALERT_INFO_CLASS_NAME, CUSTOM_ALERT_SUCCESS_CLASS_NAME } from '@/constants';
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
        type === 'success' ? CUSTOM_ALERT_SUCCESS_CLASS_NAME : CUSTOM_ALERT_INFO_CLASS_NAME;

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
