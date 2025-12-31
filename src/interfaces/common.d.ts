import { CustomFilterType, MediaType, NotificationType } from '@/enums';
import { CrudOperators } from '@refinedev/core';
import { ReactNode } from 'react';

export interface Abstract {
    id: string;
    createdAt?: Date;
    createdBy?: string | null;
    updatedBy?: string | null;
    updatedAt?: Date;
    deletedBy?: string | null;
    deletedAt?: Date | null;
}

export interface SidebarItem {
    label: string;
    icon: string;
    href?: string;
    checkAdmin?: boolean;
    children?: SidebarItem[];
}

export interface Option {
    label: string;
    key?: string;
    value?: string | number;
}

export interface PaginationRequest {
    page?: number;
    limit?: number;
    filter?: string;
    sortBy?: string[];
}

export interface FilterItem {
    span: number;
    type: CustomFilterType;

    value?: unknown;
    title?: string;
    options?: Option[];
    placeholder?: string;
    showSearch?: boolean;
    allowClear?: boolean;
    mode?: 'multiple' | 'tags';

    field?: string;
    onChange?: (value: unknown) => void;
    operation?: Exclude<CrudOperators, 'or' | 'and'>;
}

export interface ActionTableItem {
    key: string;
    label: string;
    icon: ReactNode;
    onClick: (record: unknown) => void;
}

export interface SearchFilterItem {
    name?: string;
    span?: number;
    placeholder?: string;
}

export interface FileItem {
    id: string;
    url: string;
    mimeType: string;
    lastModified: Date;
    folderName?: string;
    createdAt?: Date | string;
}

export interface FileGroup {
    files: FileItem[];
    date?: string;
    folder?: string;
}

export interface ErrorItem {
    code: string;
    message?: string;
}

export type ApiError = string | ErrorItem | ErrorItem[];

export interface Notification extends Abstract {
    title: string;
    isRead: boolean;
    type: NotificationType;
    path?: string;
    userId?: string;
    description?: string;
    data?: Record<string, unknown>;
}

export interface MediaItem {
    id: string;
    url: string;
    title: string;
    type: MediaType;
    createdAt: string;
    thumbnail?: string;
}
