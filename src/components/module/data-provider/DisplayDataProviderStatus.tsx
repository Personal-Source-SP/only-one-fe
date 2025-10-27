'use client';

import { DataProviderStatus } from '@/enums';
import { Tag } from 'antd';
import { FC, memo } from 'react';

type DisplayDataProviderStatusProps = {
    status: DataProviderStatus;
};

const DisplayDataProviderStatus: FC<DisplayDataProviderStatusProps> = ({ status }) => {
    if (!status) return '---';

    let color: string, text: string;

    switch (status) {
        case DataProviderStatus.READY:
            color = 'success';
            text = 'Sẵn sàng';
            break;
        case DataProviderStatus.TESTING:
            color = 'processing';
            text = 'Đang kiểm tra';
            break;
        case DataProviderStatus.UNCONFIGURED:
            color = 'default';
            text = 'Chưa cấu hình';
            break;
        case DataProviderStatus.ERROR:
            color = 'error';
            text = 'Lỗi';
            break;
        default:
            color = 'default';
            text = status;
    }

    return (
        <Tag color={color} className="text-sm font-medium">
            {text}
        </Tag>
    );
};

export default memo(DisplayDataProviderStatus);
