'use client';

import { ScrapeStatusEnum } from '@/enums';
import { Tag } from 'antd';
import { FC, memo } from 'react';

type DisplayScrapeStatusProps = {
    status: ScrapeStatusEnum;
};

const DisplayScrapeStatus: FC<DisplayScrapeStatusProps> = ({ status }) => {
    if (!status) return '---';

    let color: string, text: string;

    switch (status) {
        case ScrapeStatusEnum.SUCCESS:
            color = 'success';
            text = 'Đã ánh xạ';
            break;
        case ScrapeStatusEnum.ERROR:
            color = 'default';
            text = 'Chưa ánh xạ';
            break;
        case ScrapeStatusEnum.PROCESSING:
            color = 'processing';
            text = 'Đã ánh xạ (có giá)';
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

export default memo(DisplayScrapeStatus);
