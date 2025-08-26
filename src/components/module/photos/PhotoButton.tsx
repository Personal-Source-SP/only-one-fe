'use client';

import { Button, Input } from '@heroui/react';
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
                size="sm"
                value={searchQuery}
                className="w-full sm:w-64"
                placeholder="Tìm kiếm ảnh của bạn..."
                onValueChange={(value) => setSearchQuery(value.trim())}
                startContent={<Icon icon="lucide:search" className="text-foreground-500" />}
            />

            <div className="flex justify-between items-center w-full gap-2">
                <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    className="w-full"
                    onPress={() => setIsOpenFilter(true)}
                    startContent={<Icon icon="lucide:settings-2" />}
                >
                    Bộ lọc
                </Button>
                <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    className="w-full"
                    onPress={startSlideshow}
                    startContent={<Icon icon="lucide:play" />}
                >
                    Trình chiếu
                </Button>
            </div>
        </div>
    );
};

export default memo(PhotoButton);
