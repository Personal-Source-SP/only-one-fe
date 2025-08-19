import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type PhotosViewMode = 'time' | 'all';
export type PhotosSortOrder = 'newest' | 'oldest';

type PhotosStore = {
    // UI state
    searchQuery: string;
    filterFolder: string | null;
    sortOrder: PhotosSortOrder;
    currentPage: number;
    itemsPerPage: number;
    viewMode: PhotosViewMode;

    // Lightbox / slideshow state
    selectedPhoto: string | null;
    currentIndex: number;
    isLightboxOpen: boolean;
    isSlideshow: boolean;
    slideshowInterval: number;
    slideshowPaused: boolean;

    // Actions
    setSearchQuery: (value: string) => void;
    setFilterFolder: (value: string | null) => void;
    setSortOrder: (value: PhotosSortOrder) => void;
    setCurrentPage: (value: number) => void;
    setItemsPerPage: (value: number) => void;
    setViewMode: (value: PhotosViewMode) => void;

    openLightbox: (url: string, index: number) => void;
    closeLightbox: () => void;
    setSelectedPhoto: (url: string | null) => void;
    setCurrentIndex: (index: number) => void;

    startSlideshow: () => void;
    stopSlideshow: () => void;
    toggleSlideshowPause: () => void;
    setSlideshowInterval: (seconds: number) => void;

    resetFilters: () => void;
};

export const usePhotosStore = create<PhotosStore>()(
    persist(
        immer((set) => ({
            // Defaults
            searchQuery: '',
            filterFolder: null,
            sortOrder: 'newest',
            currentPage: 1,
            itemsPerPage: 12,
            viewMode: 'time',

            selectedPhoto: null,
            currentIndex: 0,
            isLightboxOpen: false,
            isSlideshow: false,
            slideshowInterval: 5,
            slideshowPaused: false,

            setSearchQuery: (value) =>
                set((state) => {
                    state.searchQuery = value;
                }),
            setFilterFolder: (value) =>
                set((state) => {
                    state.filterFolder = value;
                }),
            setSortOrder: (value) =>
                set((state) => {
                    state.sortOrder = value;
                }),
            setCurrentPage: (value) =>
                set((state) => {
                    state.currentPage = value;
                }),
            setItemsPerPage: (value) =>
                set((state) => {
                    state.itemsPerPage = value;
                    state.currentPage = 1; // reset page
                }),
            setViewMode: (value) =>
                set((state) => {
                    state.viewMode = value;
                }),

            openLightbox: (url, index) =>
                set((state) => {
                    state.selectedPhoto = url;
                    state.currentIndex = index;
                    state.isLightboxOpen = true;
                }),
            closeLightbox: () =>
                set((state) => {
                    state.isLightboxOpen = false;
                    state.selectedPhoto = null;
                }),
            setSelectedPhoto: (url) =>
                set((state) => {
                    state.selectedPhoto = url;
                }),
            setCurrentIndex: (index) =>
                set((state) => {
                    state.currentIndex = index;
                }),

            startSlideshow: () =>
                set((state) => {
                    state.isSlideshow = true;
                    state.slideshowPaused = false;
                    state.isLightboxOpen = true;
                }),
            stopSlideshow: () =>
                set((state) => {
                    state.isSlideshow = false;
                    state.slideshowPaused = false;
                }),
            toggleSlideshowPause: () =>
                set((state) => {
                    state.slideshowPaused = !state.slideshowPaused;
                }),
            setSlideshowInterval: (seconds) =>
                set((state) => {
                    state.slideshowInterval = seconds;
                }),

            resetFilters: () =>
                set((state) => {
                    state.searchQuery = '';
                    state.filterFolder = null;
                    state.sortOrder = 'newest';
                    state.viewMode = 'time';
                    state.currentPage = 1;
                }),
        })),
        {
            name: 'photos_prefs',
            partialize: (state) => ({
                filterFolder: state.filterFolder,
                sortOrder: state.sortOrder,
                itemsPerPage: state.itemsPerPage,
                viewMode: state.viewMode,
                slideshowInterval: state.slideshowInterval,
            }),
        },
    ),
);
