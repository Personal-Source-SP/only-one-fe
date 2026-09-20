'use client';

import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import type { MediaLightboxProps } from './types';

import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/styles.css';

export const MediaLightbox = ({
    index,
    isOpen,
    slides,
    slideshowInterval = 3,
    closeLightbox,
}: MediaLightboxProps) => {
    return (
        <Lightbox
            open={isOpen}
            index={index}
            slides={slides}
            close={closeLightbox}
            slideshow={{ delay: slideshowInterval * 1000 }}
            plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
        />
    );
};
