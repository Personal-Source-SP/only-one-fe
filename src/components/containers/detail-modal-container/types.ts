import type { ReactNode } from 'react';
import type { BaseRecord } from '@refinedev/core';

import type { IDetailSection } from '@/components';
import type { UseCustomModalDetailReturnType } from '@/hooks';

export type DetailModalContainerProps<TRecord extends object = Record<string, unknown>> = {
    detailModal: UseCustomModalDetailReturnType<BaseRecord, TRecord>;
    title?: ReactNode;
    closeText?: ReactNode;
    width?: number | string;
    sections?: IDetailSection<TRecord>[];
    children?: ReactNode | ((data: TRecord) => ReactNode);
    extraActions?: ReactNode | ((data: TRecord, onClose: () => void) => ReactNode);
};
