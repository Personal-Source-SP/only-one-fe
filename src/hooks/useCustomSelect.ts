import { NDataProvider, NGoogle } from '@/interfaces';
import { useSelect } from '@refinedev/core';

interface IUseSelectProps<T> {
    id?: string;
    resource?: string;
    enabled?: boolean;
    optionValue?: (item: T) => string;
    optionLabel?: (item: T) => string;
}

export const useSelectDataProviderItem = (
    props?: IUseSelectProps<NDataProvider.IDataProviderItem>,
) => {
    const { options, query } = useSelect<NDataProvider.IDataProviderItem>({
        resource: `data-provider-items/data-provider/${props?.id}`,
        optionValue:
            props?.optionValue ?? ((item: NDataProvider.IDataProviderItem) => item.itemUrl ?? ''),
        optionLabel:
            props?.optionLabel ?? ((item: NDataProvider.IDataProviderItem) => item.itemUrl ?? ''),
        pagination: { mode: 'off' },
        queryOptions: { enabled: !!props?.id || props?.enabled },
    });

    return { options, query };
};

export const useSelectDataProvider = (props?: IUseSelectProps<NDataProvider.IDataProvider>) => {
    const { options, query } = useSelect<NDataProvider.IDataProvider>({
        resource: 'data-providers/all',
        optionValue: props?.optionValue ?? ((item: NDataProvider.IDataProvider) => item.id ?? ''),
        optionLabel:
            props?.optionLabel ?? ((item: NDataProvider.IDataProvider) => item.baseUrl ?? ''),
        pagination: { mode: 'off' },
        queryOptions: { enabled: props?.enabled ?? true },
    });

    return { options, query };
};

export const useSelectGoogleFolder = (props?: IUseSelectProps<NGoogle.IGoogleDriveFolder>) => {
    const { options, query } = useSelect<NGoogle.IGoogleDriveFolder>({
        resource: 'google-folder/all',
        optionValue: props?.optionValue ?? ((item: NGoogle.IGoogleDriveFolder) => item.id ?? ''),
        optionLabel: props?.optionLabel ?? ((item: NGoogle.IGoogleDriveFolder) => item.name ?? ''),
        pagination: { mode: 'off' },
        queryOptions: { enabled: props?.enabled ?? true },
    });

    return { options, query };
};

export const useSelectItem = (props?: IUseSelectProps<NDataProvider.IItem>) => {
    const { options, query } = useSelect<NDataProvider.IItem>({
        resource: 'items/all',
        optionValue: props?.optionValue ?? ((item: NDataProvider.IItem) => item.id ?? ''),
        optionLabel: props?.optionLabel ?? ((item: NDataProvider.IItem) => item.name ?? ''),
        pagination: { mode: 'off' },
        queryOptions: { enabled: props?.enabled ?? true },
    });

    return { options, query };
};

export const useCustomSelect = (props: IUseSelectProps<any>) => {
    const { enabled, resource, optionValue, optionLabel } = props;

    const { options, query } = useSelect<any>({
        resource: resource ?? '',
        optionValue: optionValue ?? ((item: any) => item.id ?? ''),
        optionLabel: optionLabel ?? ((item: any) => item.name ?? ''),
        pagination: { mode: 'off' },
        queryOptions: { enabled: enabled ?? true },
    });

    return { options, query };
};
