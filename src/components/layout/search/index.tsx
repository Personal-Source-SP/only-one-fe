import { Button, Input } from '@heroui/react';
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
            <Input
                fullWidth
                placeholder="Tìm kiếm..."
                startContent={<Icon icon="lucide:search" className="text-foreground-500" />}
                endContent={
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => setShowSearch(false)}
                    >
                        <Icon icon="lucide:x" />
                    </Button>
                }
                autoFocus
            />
        </div>
    );
};

export default memo(Search);
