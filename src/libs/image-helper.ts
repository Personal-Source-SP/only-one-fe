import { QualityMode } from '@/enums';
import { NGoogle } from '@/interfaces';

export const getProxyUrl = (url: string): string => {
    if (!url) return '';
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

export const getDriveImageUrl = (
    googleDriveFile: NGoogle.IGoogleDriveFile,
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
