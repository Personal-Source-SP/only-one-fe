'use client';

import { useCallback, useMemo, useState } from 'react';
import { useModal } from '@refinedev/antd';
import type { BaseKey, BaseRecord } from '@refinedev/core';

import type { IBaseApiNotificationRequest, IBaseApiTransformRequest } from '@/interfaces';

import { useCustomOne, type UseCustomOneRequest } from './useCustomOne';

export type UseCustomModalDetailProps<
    TData extends BaseRecord = BaseRecord,
    TTransformed = TData,
> = IBaseApiNotificationRequest &
    IBaseApiTransformRequest<TData, TTransformed> & {
        resource?: string;
        id?: BaseKey | null;
        queryOptions?: UseCustomOneRequest<TData, TTransformed>['queryOptions'];
    };

export type UseCustomModalDetailReturnType<
    TData extends BaseRecord = BaseRecord,
    TTransformed = TData,
> = {
    open: boolean;
    id: BaseKey | null;
    isLoading: boolean;
    isFetching: boolean;
    data: TTransformed | null;
    record: TTransformed | null;
    close: () => void;
    refetch: () => Promise<unknown>;
    show: (target?: BaseKey | TTransformed | null) => void;
    modalProps: {
        open: boolean;
        onCancel: () => void;
    };
    detailQuery: {
        data: TTransformed | null;
        isLoading: boolean;
        isFetching: boolean;
        refetch: () => Promise<unknown>;
    };
};

export const useCustomModalDetail = <TData extends BaseRecord = BaseRecord, TTransformed = TData>({
    resource,
    id: initialId = null,
    queryOptions,
    transform,
    ...rest
}: UseCustomModalDetailProps<TData, TTransformed> = {}): UseCustomModalDetailReturnType<
    TData,
    TTransformed
> => {
    const { modalProps, show: showModal, close: closeModal } = useModal();

    const [selectedId, setSelectedId] = useState<BaseKey | null>(initialId);
    const [directRecord, setDirectRecord] = useState<TTransformed | null>(null);

    const isApiEnabled = Boolean(
        resource && selectedId !== null && selectedId !== undefined && modalProps.open,
    );

    const queryOne = useCustomOne<TData, TTransformed>({
        ...rest,
        id: selectedId,
        resource: resource ?? '',
        transform,
        queryOptions: {
            ...queryOptions,
            enabled: queryOptions?.enabled !== undefined ? queryOptions.enabled : isApiEnabled,
        },
    });

    const show = useCallback(
        (target?: BaseKey | TTransformed | null) => {
            if (target !== undefined && target !== null) {
                if (typeof target === 'object') {
                    setDirectRecord(target);
                    const obj = target as Record<string, unknown>;
                    if ('id' in obj && (typeof obj.id === 'string' || typeof obj.id === 'number')) {
                        setSelectedId(obj.id);
                    } else {
                        setSelectedId(null);
                    }
                } else {
                    setSelectedId(target as BaseKey);
                    setDirectRecord(null);
                }
            }
            showModal();
        },
        [showModal],
    );

    const close = useCallback(() => {
        closeModal();
        setSelectedId(null);
        setDirectRecord(null);
    }, [closeModal]);

    const activeData = useMemo(
        () => (directRecord ?? queryOne.data ?? null) as TTransformed | null,
        [directRecord, queryOne.data],
    );

    const isLoading = useMemo(
        () => Boolean(resource && selectedId && queryOne.isLoading),
        [resource, selectedId, queryOne.isLoading],
    );

    const resolvedModalProps = useMemo(
        () => ({
            open: Boolean(modalProps.open),
            onCancel: close,
        }),
        [modalProps.open, close],
    );

    const detailQuery = useMemo(
        () => ({
            data: activeData,
            isLoading,
            isFetching: Boolean(queryOne.query?.isFetching),
            refetch: queryOne.query?.refetch ?? (async () => {}),
        }),
        [activeData, isLoading, queryOne.query?.isFetching, queryOne.query?.refetch],
    );

    return {
        show,
        close,
        isLoading,
        detailQuery,
        id: selectedId,
        data: activeData,
        record: activeData,
        open: resolvedModalProps.open,
        modalProps: resolvedModalProps,
        isFetching: Boolean(queryOne.query?.isFetching),
        refetch: queryOne.query?.refetch ?? (async () => {}),
    };
};
