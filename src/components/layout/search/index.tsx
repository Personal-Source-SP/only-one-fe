'use client';

import { CustomButton, CustomInput } from '@/components/custom-antd';
import { Icon } from '@iconify/react';

type SearchProps = {
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
};

export const Search = ({ showSearch, setShowSearch }: SearchProps) => {
    if (!showSearch) return <></>;

    return (
        <div className="p-2 border-b border-divider md:hidden">
            <div className="relative">
                <CustomInput
                    placeholder="Tìm kiếm..."
                    prefix={<Icon icon="lucide:search" className="text-foreground-500" />}
                    autoFocus
                />
                <CustomButton
                    size="small"
                    type="text"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => setShowSearch(false)}
                    icon={<Icon icon="lucide:x" />}
                />
            </div>
        </div>
    );
};
