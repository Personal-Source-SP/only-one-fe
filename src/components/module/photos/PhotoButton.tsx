'use client';

import { Button, Input } from 'antd';
import { Icon } from '@iconify/react';
import { FC, memo } from 'react';

type PhotoButtonProps = {
    searchQuery?: string;
    startSlideshow: () => void;
    setSearchQuery: (value: string) => void;
    setIsOpenFilter: (value: boolean) => void;
};

const PhotoButton: FC<PhotoButtonProps> = ({
    searchQuery,
    setSearchQuery,
    setIsOpenFilter,
    startSlideshow,
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Input
                size="small"
                value={searchQuery}
                className="w-full sm:w-64"
                placeholder="Tìm kiếm ảnh của bạn..."
                onChange={(e) => setSearchQuery(e.target.value.trim())}
                prefix={<Icon icon="lucide:search" className="text-foreground-500" />}
            />

            <div className="flex justify-between items-center w-full gap-2">
                <Button
                    size="small"
                    type="primary"
                    className="w-full"
                    onClick={() => setIsOpenFilter(true)}
                >
                    <span className="inline-flex items-center">
                        <Icon icon="lucide:settings-2" className="mr-2" /> Bộ lọc
                    </span>
                </Button>
                <Button size="small" type="primary" className="w-full" onClick={startSlideshow}>
                    <span className="inline-flex items-center">
                        <Icon icon="lucide:play" className="mr-2" /> Trình chiếu
                    </span>
                </Button>
            </div>
        </div>
    );
};

export default memo(PhotoButton);
