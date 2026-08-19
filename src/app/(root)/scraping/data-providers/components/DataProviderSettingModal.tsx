'use client';

import type { FC, JSX } from 'react';
import type {
    DataProviderRecord,
    SettingConfigType,
} from '@/app/(root)/scraping/data-providers/types';
import { DataProviderSearchModal } from './DataProviderSearchModal';
import { DataProviderTargetModal } from './DataProviderTargetModal';

export interface DataProviderSettingModalProps {
    open: boolean;
    configType?: SettingConfigType;
    record: DataProviderRecord | null;
    onClose: () => void;
    onSuccess?: () => void;
}

export const DataProviderSettingModal: FC<DataProviderSettingModalProps> = (
    props: DataProviderSettingModalProps,
): JSX.Element => {
    if (props.configType === 'search') {
        return <DataProviderSearchModal {...props} />;
    }
    return <DataProviderTargetModal {...props} />;
};
