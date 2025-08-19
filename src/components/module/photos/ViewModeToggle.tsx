'use client';

import { Switch } from '@heroui/react';
import { memo, FC } from 'react';

export type ViewModeToggleProps = {
    viewMode: 'time' | 'all';
    onToggle: () => void;
};

const ViewModeToggle: FC<ViewModeToggleProps> = ({ viewMode, onToggle }) => {
    return (
        <div className="flex items-center justify-end gap-2">
            <span className="text-sm">Xem theo thời gian</span>
            <Switch checked={viewMode === 'time'} onChange={onToggle} />
        </div>
    );
};

export default memo(ViewModeToggle);
