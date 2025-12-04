import { NCloudData, NDataProvider, NGoogle } from '@/interfaces';
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

export const useSelectDataProviderItem = (
    props?: IUseSelectProps<NDataProvider.IDataProviderItem>,
) => {
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
        optionValue:
            props?.optionValue ?? ((item: NDataProvider.IDataProviderItem) => item.itemUrl ?? ''),
        optionLabel:
            props?.optionLabel ?? ((item: NDataProvider.IDataProviderItem) => item.itemUrl ?? ''),
    });
};

export const useSelectDataProvider = (props?: IUseSelectProps<NDataProvider.IDataProvider>) => {
    return useCustomSelect({
        resource: 'data-providers/all',
        enabled: props?.enabled ?? true,
        optionValue: props?.optionValue ?? ((item: NDataProvider.IDataProvider) => item.id ?? ''),
        optionLabel:
            props?.optionLabel ??
            ((item: NDataProvider.IDataProvider) =>
                item.baseUrl ? `${item.name} - ${item.baseUrl}` : (item.name ?? '')),
    });
};

export const useSelectItem = (props?: IUseSelectProps<NDataProvider.IItem>) => {
    return useCustomSelect({
        resource: 'items/all',
        enabled: props?.enabled ?? true,
        optionValue: props?.optionValue ?? ((item: NDataProvider.IItem) => item.id ?? ''),
        optionLabel: props?.optionLabel ?? ((item: NDataProvider.IItem) => item.name ?? ''),
    });
};

export const useSelectGoogleFolder = (props?: IUseSelectProps<NGoogle.IGoogleDriveFolder>) => {
    return useCustomSelect({
        resource: 'google-folder/all',
        enabled: props?.enabled ?? true,
        optionValue: props?.optionValue ?? ((item: NGoogle.IGoogleDriveFolder) => item.id ?? ''),
        optionLabel: props?.optionLabel ?? ((item: NGoogle.IGoogleDriveFolder) => item.name ?? ''),
    });
};

export const useSelectCloudDataProvider = (
    props?: IUseSelectProps<NCloudData.ICloudDataProvider>,
) => {
    return useCustomSelect({
        resource: 'cloud-data-providers/all',
        enabled: props?.enabled ?? true,
        optionValue: props?.optionValue ?? ((item: NCloudData.ICloudDataProvider) => item.id ?? ''),
        optionLabel:
            props?.optionLabel ?? ((item: NCloudData.ICloudDataProvider) => item.name ?? ''),
    });
};
