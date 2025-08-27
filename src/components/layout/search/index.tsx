import { Button, Input } from 'antd';
import { Icon } from '@iconify/react';
import { FC, memo } from 'react';

type SearchProps = {
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
};

const Search: FC<SearchProps> = ({ showSearch, setShowSearch }) => {
    if (!showSearch) return <></>;

    return (
        <div className="p-2 border-b border-divider md:hidden">
            <div className="relative">
                <Input
                    placeholder="Tìm kiếm..."
                    prefix={<Icon icon="lucide:search" className="text-foreground-500" />}
                    autoFocus
                />
                <Button
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

export default memo(Search);
