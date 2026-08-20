import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import type { IItem } from '@/app/(root)/scraping/items/types';
import type {
    IDataProviderItem,
    RegisterLocalFolderRequest,
    RegisterLocalFolderResponse,
} from '@/app/(root)/scraping/provider-items/types';
import { LocalFolderRegistrationStatusEnum } from '@/enums';
import { deburr, find, kebabCase, toLower } from 'lodash';

type BuildLocalFolderRegistrationInput = {
    dataProvider: IDataProvider;
    folderName: string;
    folderPath?: string;
};

type ResolveLocalFolderRecordStateInput = {
    items: IItem[];
    providerItems: IDataProviderItem[];
    request: RegisterLocalFolderRequest;
};

type ResolveLocalFolderRecordStateResponse = {
    existingItem?: IItem;
    existingProviderItem?: IDataProviderItem;
};

type BuildLocalFolderSuccessResponseInput = {
    itemId: string;
    request: RegisterLocalFolderRequest;
    createdItem: boolean;
    dataProviderItemId: string;
};

export const normalizeLocalFolderIdentifier = (folderName: string): string => {
    return kebabCase(deburr(folderName ?? ''));
};

export const buildLocalFolderItemUrl = (baseUrl: string, folderIdentifier: string): string => {
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    return `${normalizedBaseUrl}/${folderIdentifier}`;
};

export const buildLocalFolderRegistrationRequest = ({
    folderName,
    folderPath,
    dataProvider,
}: BuildLocalFolderRegistrationInput): RegisterLocalFolderRequest => {
    const normalizedFolderName = folderName.trim();
    const normalizedFolderPath = folderPath?.trim();
    const folderIdentifier = normalizeLocalFolderIdentifier(normalizedFolderName);
    const itemUrl = buildLocalFolderItemUrl(dataProvider.baseUrl, folderIdentifier);

    return {
        itemUrl,
        folderIdentifier,
        dataProviderId: dataProvider.id,
        itemCode: normalizedFolderName,
        itemName: normalizedFolderName,
        folderName: normalizedFolderName,
        folderPath: normalizedFolderPath || undefined,
    };
};

export const resolveLocalFolderRecordState = ({
    items,
    providerItems,
    request,
}: ResolveLocalFolderRecordStateInput): ResolveLocalFolderRecordStateResponse => {
    const targetItemCode = toLower(request.itemCode ?? '');
    const targetItemUrl = toLower(request.itemUrl ?? '');

    const existingItem = find(items, (item) => toLower(item.code ?? '') === targetItemCode);

    const existingProviderItem = find(
        providerItems,
        (providerItem) =>
            providerItem.dataProviderId === request.dataProviderId &&
            toLower(providerItem.itemUrl ?? '') === targetItemUrl,
    );

    return {
        existingItem,
        existingProviderItem,
    };
};

export const buildLocalFolderSuccessResponse = ({
    itemId,
    request,
    createdItem,
    dataProviderItemId,
}: BuildLocalFolderSuccessResponseInput): RegisterLocalFolderResponse => {
    return {
        itemId,
        dataProviderItemId,
        itemUrl: request.itemUrl,
        itemStatus: createdItem
            ? LocalFolderRegistrationStatusEnum.CREATED
            : LocalFolderRegistrationStatusEnum.REUSED,
    };
};
