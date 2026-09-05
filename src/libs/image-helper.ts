import type { IGoogleDriveFile } from '@/app/(root)/google/drive/photos/types';
import { QualityMode } from '@/app/(root)/google/drive/enums';

export const getProxyUrl = (url: string): string => {
    if (!url) return '';
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

export const getDriveImageUrl = (
    googleDriveFile: IGoogleDriveFile,
    qualityMode: QualityMode,
): string => {
    let url = '';

    switch (qualityMode) {
        case QualityMode.HIGH: {
            url = googleDriveFile.webViewLink || '';
            break;
        }
        case QualityMode.LOW: {
            url = googleDriveFile.thumbnailLink || '';
            break;
        }
        default: {
            url = googleDriveFile.thumbnailLink || '';
            break;
        }
    }

    return getProxyUrl(url);
};

export const isLocalFilePath = (path: string | undefined): boolean => {
    if (!path) return false;

    return !(
        path.startsWith('http://') ||
        path.startsWith('https://') ||
        path.startsWith('blob:') ||
        path.startsWith('file://') ||
        path.startsWith('/')
    );
};
