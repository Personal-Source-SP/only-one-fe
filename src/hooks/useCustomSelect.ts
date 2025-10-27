import { NDataProvider, NGoogle } from '@/interfaces';
import { useSelect } from '@refinedev/core';

interface IUseSelectProps<T> {
    id?: string;
    resource?: string;
    enabled?: boolean;
    optionValue?: (item: T) => string;
    optionLabel?: (item: T) => string;
}

export const useCustomSelect = (props: IUseSelectProps<any>) => {
    const { enabled, resource, optionValue, optionLabel } = props;

    const { options, query } = useSelect<any>({
        resource: resource ?? '',
        pagination: { mode: 'off' },
        queryOptions: { enabled: enabled ?? true },
        optionValue: optionValue ?? ((item: any) => item.id ?? ''),
        optionLabel: optionLabel ?? ((item: any) => item.name ?? ''),
    });

    return { options, query };
};

export const useSelectDataProviderItem = (
    props?: IUseSelectProps<NDataProvider.IDataProviderItem>,
) => {
    return useCustomSelect({
        resource: `data-provider-items/data-provider/${props?.id}`,
        enabled: !!props?.id || props?.enabled,
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
            props?.optionLabel ?? ((item: NDataProvider.IDataProvider) => item.baseUrl ?? ''),
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
