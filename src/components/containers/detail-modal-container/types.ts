import type { ReactNode } from 'react';

import type { IDetailSection } from '@/components';

export type DetailModalContainerProps<TRecord extends object = Record<string, unknown>> = {
    open: boolean;
    onClose: () => void;
    data?: TRecord | null;
    loading?: boolean;
    title?: ReactNode;
    icon?: string | ReactNode;
    badge?: ReactNode;
    width?: number | string;
    closeText?: ReactNode;
    extraActions?: ReactNode | ReactNode[] | ((data: TRecord, onClose: () => void) => ReactNode);
    footer?: ReactNode | false | ((data: TRecord | null, onClose: () => void) => ReactNode);
    sections?: IDetailSection<TRecord>[];
    children?: ReactNode | ((data: TRecord) => ReactNode);
    className?: string;
    bodyClassName?: string;
};
