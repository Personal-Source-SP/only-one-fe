import { LocalFolderRegistrationStatusEnum } from '@/enums';
import { NDataProvider } from '@/interfaces';
import { deburr, find, kebabCase, toLower } from 'lodash';

type BuildLocalFolderRegistrationInput = {
    dataProvider: NDataProvider.IDataProvider;
    folderName: string;
    folderPath?: string;
};

type ResolveLocalFolderRecordStateInput = {
    items: NDataProvider.IItem[];
    providerItems: NDataProvider.IDataProviderItem[];
    request: NDataProvider.RegisterLocalFolderRequest;
};

type ResolveLocalFolderRecordStateResponse = {
    existingItem?: NDataProvider.IItem;
    existingProviderItem?: NDataProvider.IDataProviderItem;
};

type BuildLocalFolderSuccessResponseInput = {
    itemId: string;
    request: NDataProvider.RegisterLocalFolderRequest;
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
}: BuildLocalFolderRegistrationInput): NDataProvider.RegisterLocalFolderRequest => {
    const normalizedFolderName = folderName.trim();
    const normalizedFolderPath = folderPath?.trim();
    const folderReference = normalizedFolderPath || normalizedFolderName;
    const folderIdentifier = normalizeLocalFolderIdentifier(folderReference);

    return {
        itemUrl: buildLocalFolderItemUrl(dataProvider.baseUrl, folderIdentifier),
        itemCode: folderIdentifier,
        itemName: normalizedFolderName,
        folderName: normalizedFolderName,
        folderPath: normalizedFolderPath || undefined,
        dataProviderId: dataProvider.id,
        folderIdentifier,
    };
};

export const resolveLocalFolderRecordState = ({
    items,
    request,
    providerItems,
}: ResolveLocalFolderRecordStateInput): ResolveLocalFolderRecordStateResponse => {
    const existingItem = find(items, (item) => {
        if (item.code === request.itemCode) {
            return true;
        }

        return toLower(item.name) === toLower(request.itemName);
    });

    const existingProviderItem = find(providerItems, (providerItem) => {
        return providerItem.itemUrl === request.itemUrl;
    });

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
}: BuildLocalFolderSuccessResponseInput): NDataProvider.RegisterLocalFolderResponse => {
    return {
        itemId,
        itemUrl: request.itemUrl,
        itemStatus: createdItem
            ? LocalFolderRegistrationStatusEnum.CREATED
            : LocalFolderRegistrationStatusEnum.REUSED,
        dataProviderItemId,
    };
};
