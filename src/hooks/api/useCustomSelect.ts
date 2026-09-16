import type { ICloudDataProvider } from '@/app/(root)/cloud-data/providers/types';
import type { IGoogleDriveFolder } from '@/app/(root)/google/drive/folders/types';
import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import type {
    DataProviderFeatureStatus,
    DataProviderFeatureType,
} from '@/app/(root)/scraping/features/enums';
import type { IItem } from '@/app/(root)/scraping/items/types';
import type { IDataProviderItem } from '@/app/(root)/scraping/provider-items/types';
import type { ISimulationContext } from '@/app/(root)/simulation/contexts/types';
import { API_ENDPOINT } from '@/config';
import type { IBaseApiQueryRequest, IBaseApiTransformRequest, Option } from '@/interfaces';
import { applyDataTransform } from '@/utilities';
import { BaseRecord, CrudFilter, useSelect } from '@refinedev/core';
import { useMemo } from 'react';

export interface IUseSelectProps<T extends BaseRecord = any>
    extends IBaseApiQueryRequest, IBaseApiTransformRequest<Option<string>[], Option<string>[]> {
    id?: string;
    resource?: string;
    defaultFilters?: CrudFilter[];
    type?: 'items' | 'data-provider' | 'data-provider-items';
    filter?: (item: T) => boolean;
    optionLabel?: (item: T) => string;
    optionValue?: (item: T) => string;
}

export const useCustomSelect = <T extends BaseRecord = any>(props: IUseSelectProps<T>) => {
    const {
        enabled,
        queryOptions,
        resource,
        defaultFilters,
        optionValue,
        optionLabel,
        filter,
        transform,
    } = props;

    const { options, query } = useSelect<T>({
        resource: resource ?? '',
        pagination: { mode: 'off' },
        filters: defaultFilters ?? undefined,
        queryOptions: { enabled: enabled ?? false, ...queryOptions },
        sorters: [{ field: 'createdAt', order: 'desc' }],
        optionValue: optionValue ?? ((item: any) => item.id ?? ''),
        optionLabel: optionLabel ?? ((item: any) => item.name ?? ''),
    });

    const transformedOptions = useMemo(() => {
        let resultOptions = options;
        if (filter && query.data?.data) {
            const rawData = query.data.data as T[];
            const getValue = optionValue ?? ((item: any) => item.id ?? '');
            const getLabel = optionLabel ?? ((item: any) => item.name ?? '');
            resultOptions = rawData.filter(filter).map((item) => ({
                label: getLabel(item),
                value: getValue(item),
            }));
        }

        return applyDataTransform(resultOptions, query.data, transform);
    }, [options, filter, query.data, optionValue, optionLabel, transform]);

    return { options: transformedOptions, query };
};

export const useSelectDataProviderItem = (props?: IUseSelectProps<IDataProviderItem>) => {
    let resource = '';
    switch (props?.type) {
        case 'items':
            resource = `data-provider-items/item/${props?.id}`;
            break;
        case 'data-provider':
            resource = `data-provider-items/data-provider/${props?.id}`;
            break;
        default:
            resource = API_ENDPOINT.DATA_PROVIDER_ITEMS.ALL;
            break;
    }

    return useCustomSelect({
        ...props,
        resource,
        enabled: !!props?.id || (props?.enabled ?? false),
        optionValue: props?.optionValue ?? ((item: IDataProviderItem) => item.itemUrl ?? ''),
        optionLabel: props?.optionLabel ?? ((item: IDataProviderItem) => item.itemUrl ?? ''),
    });
};

export interface IUseSelectDataProviderProps extends IUseSelectProps<IDataProvider> {
    withFeatures?: boolean;
    featureType?: DataProviderFeatureType;
    featureStatus?: DataProviderFeatureStatus;
}

export const useSelectDataProvider = (props?: IUseSelectDataProviderProps) => {
    let resource = API_ENDPOINT.DATA_PROVIDERS.ALL;
    if (props?.withFeatures || props?.featureType || props?.featureStatus) {
        const queryParams = new URLSearchParams();
        if (props?.featureType) queryParams.set('featureType', props.featureType);
        if (props?.featureStatus) queryParams.set('featureStatus', props.featureStatus);
        const queryString = queryParams.toString();
        resource = queryString
            ? `${API_ENDPOINT.DATA_PROVIDERS.ALL_WITH_FEATURES}?${queryString}`
            : API_ENDPOINT.DATA_PROVIDERS.ALL_WITH_FEATURES;
    }

    return useCustomSelect({
        ...props,
        resource: props?.resource ?? resource,
        enabled: props?.enabled ?? true,
        optionValue: props?.optionValue ?? ((item: IDataProvider) => item.id ?? ''),
        optionLabel:
            props?.optionLabel ??
            ((item: IDataProvider) =>
                item.baseUrl ? `${item.name} - ${item.baseUrl}` : (item.name ?? '')),
    });
};

export const useSelectItem = (props?: IUseSelectProps<IItem>) => {
    return useCustomSelect({
        ...props,
        resource: API_ENDPOINT.ITEMS.ALL,
        enabled: props?.enabled ?? true,
        optionValue: props?.optionValue ?? ((item: IItem) => item.id ?? ''),
        optionLabel: props?.optionLabel ?? ((item: IItem) => item.name ?? ''),
    });
};

export const useSelectGoogleFolder = (props?: IUseSelectProps<IGoogleDriveFolder>) => {
    return useCustomSelect({
        ...props,
        resource: API_ENDPOINT.GOOGLE_DRIVE.FOLDERS_ALL,
        enabled: props?.enabled ?? true,
        optionValue: props?.optionValue ?? ((item: IGoogleDriveFolder) => item.id ?? ''),
        optionLabel: props?.optionLabel ?? ((item: IGoogleDriveFolder) => item.name ?? ''),
    });
};

export const useSelectCloudDataProvider = (props?: IUseSelectProps<ICloudDataProvider>) => {
    return useCustomSelect({
        ...props,
        resource: API_ENDPOINT.CLOUD_DATA_PROVIDERS.ALL,
        enabled: props?.enabled ?? true,
        optionValue: props?.optionValue ?? ((item: ICloudDataProvider) => item.id ?? ''),
        optionLabel: props?.optionLabel ?? ((item: ICloudDataProvider) => item.name ?? ''),
    });
};

export const useSelectSimulationContext = (props?: IUseSelectProps<ISimulationContext>) => {
    return useCustomSelect({
        ...props,
        resource: API_ENDPOINT.SIMULATION.CONTEXTS_ALL,
        enabled: props?.enabled ?? true,
        optionValue: props?.optionValue ?? ((item: ISimulationContext) => item.id ?? ''),
        optionLabel: props?.optionLabel ?? ((item: ISimulationContext) => item.name ?? ''),
    });
};
