import type { SlideImage } from 'yet-another-react-lightbox';

export interface IFileItem {
    id: string;
    url: string;
    mimeType: string;
    lastModified: Date;
    folderName?: string;
    createdAt?: Date | string;
}

export interface IFileGroup {
    files: IFileItem[];
    date?: string;
    folder?: string;
}

export type MediaLightboxProps = {
    index: number;
    isOpen: boolean;
    slides: SlideImage[];
    slideshowInterval?: number;
    closeLightbox: () => void;
};
