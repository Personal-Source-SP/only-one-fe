import type { ICloudDataProvider } from '@/app/(root)/cloud-data/providers/types';
import type { IGoogleDriveFolder } from '@/app/(root)/google/drive/folders/types';
import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import type { IItem } from '@/app/(root)/scraping/items/types';
import type { IDataProviderItem } from '@/app/(root)/scraping/provider-items/types';
import type { ISimulationContext } from '@/app/(root)/simulation/contexts/types';
import { CrudFilter, useSelect } from '@refinedev/core';

interface IUseSelectProps<T> {
    id?: string;
    resource?: string;
    enabled?: boolean;
    defaultFilters?: CrudFilter[];
    type?: 'items' | 'data-provider' | 'data-provider-items';
    optionValue?: (item: T) => string;
    optionLabel?: (item: T) => string;
}

export const useCustomSelect = (props: IUseSelectProps<any>) => {
    const { enabled, resource, defaultFilters, optionValue, optionLabel } = props;

    const { options, query } = useSelect<any>({
        resource: resource ?? '',
        pagination: { mode: 'off' },
        filters: defaultFilters ?? undefined,
        queryOptions: { enabled: enabled ?? false },
        sorters: [{ field: 'createdAt', order: 'desc' }],
        optionValue: optionValue ?? ((item: any) => item.id ?? ''),
        optionLabel: optionLabel ?? ((item: any) => item.name ?? ''),
    });

    return { options, query };
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
            resource = 'data-provider-items/all';
            break;
    }

    return useCustomSelect({
        resource,
        enabled: !!props?.id || (props?.enabled ?? false),
        optionValue: props?.optionValue ?? ((item: IDataProviderItem) => item.itemUrl ?? ''),
        optionLabel: props?.optionLabel ?? ((item: IDataProviderItem) => item.itemUrl ?? ''),
    });
};

export const useSelectDataProvider = (props?: IUseSelectProps<IDataProvider>) => {
    return useCustomSelect({
        resource: 'data-providers/all',
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
        resource: 'items/all',
        enabled: props?.enabled ?? true,
        optionValue: props?.optionValue ?? ((item: IItem) => item.id ?? ''),
        optionLabel: props?.optionLabel ?? ((item: IItem) => item.name ?? ''),
    });
};

export const useSelectGoogleFolder = (props?: IUseSelectProps<IGoogleDriveFolder>) => {
    return useCustomSelect({
        resource: 'google-folder/all',
        enabled: props?.enabled ?? true,
        optionValue: props?.optionValue ?? ((item: IGoogleDriveFolder) => item.id ?? ''),
        optionLabel: props?.optionLabel ?? ((item: IGoogleDriveFolder) => item.name ?? ''),
    });
};

export const useSelectCloudDataProvider = (props?: IUseSelectProps<ICloudDataProvider>) => {
    return useCustomSelect({
        resource: 'cloud-data-providers/all',
        enabled: props?.enabled ?? true,
        optionValue: props?.optionValue ?? ((item: ICloudDataProvider) => item.id ?? ''),
        optionLabel: props?.optionLabel ?? ((item: ICloudDataProvider) => item.name ?? ''),
    });
};

export const useSelectSimulationContext = (props?: IUseSelectProps<ISimulationContext>) => {
    return useCustomSelect({
        resource: 'simulation-contexts/all',
        enabled: props?.enabled ?? true,
        optionValue: props?.optionValue ?? ((item: ISimulationContext) => item.id ?? ''),
        optionLabel: props?.optionLabel ?? ((item: ISimulationContext) => item.name ?? ''),
    });
};
