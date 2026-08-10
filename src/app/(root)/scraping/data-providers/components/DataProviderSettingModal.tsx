'use client';

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

export const DataProviderSettingModal = (props: DataProviderSettingModalProps) => {
    if (props.configType === 'search') {
        return <DataProviderSearchModal {...props} />;
    }
    return <DataProviderTargetModal {...props} />;
};
