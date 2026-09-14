import { getProxyUrl } from '@/libs';
import { QualityMode } from '../../enums';
import type { IGoogleDriveFile } from '../types';

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
