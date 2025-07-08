'use client';

import AlbumFilters from '@/components/AlbumFilters';
import { Loading } from '@/components/common';
import CustomDrawer from '@/components/module/CustomDrawer';
import {
    IMAGE_HEIGHT_DEFAULT,
    IMAGE_WIDTH_DEFAULT,
    ITEMS_PER_PAGE_DEFAULT,
    SLIDESHOW_DELAY_DEFAULT,
} from '@/constants';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Folder, Photo, SortField, SortOrder } from '@/interfaces/album';
import { Button, message } from 'antd';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AddFolder from '../components/AddFolder';

interface AlbumContextType {
    photos: Photo[];
    folders: Folder[] | undefined;
    selectedFolder: string | undefined;
    currentPage: number;
    itemsPerPage: number;
    sortField: SortField;
    sortOrder: SortOrder;
    sortedPhotos: Photo[];
    slideShowDelay: number;
    handleSelectFolder: (path: string) => void;
    handleDeleteFolder: (path: string) => void;
    handleAddFolder: (newFolders: Folder[]) => void;
    handleOpenAddFolder: () => void;
    handleOpenAlbumFilters: () => void;
    handlePageChange: (page: number) => void;
    handleItemsPerPageChange: (value: number) => void;
    handleSortChange: (field: SortField, order: SortOrder) => void;
}

const AlbumContext = createContext<AlbumContextType | undefined>(undefined);

export const AlbumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [folders, setFolders] = useLocalStorage<Folder[]>('folders');

    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [sortedPhotos, setSortedPhotos] = useState<Photo[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_DEFAULT);

    const [photos, setPhotos] = useState<Photo[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | undefined>();
    const [slideShowDelay, setSlideShowDelay] = useState(SLIDESHOW_DELAY_DEFAULT);

    const [openAddFolder, setOpenAddFolder] = useState(false);
    const [openAlbumFilters, setOpenAlbumFilters] = useState(false);

    useEffect(() => {
        const loadPhotos = async (selectedFolder: string) => {
            try {
                const response = await fetch(`/api/getPhotoList?folder=${selectedFolder}`);
                const photoList = await response.json();

                const fetchedPhotos = photoList.map(
                    (photo: { name: string; createdAt: number }) => ({
                        title: photo.name,
                        createdAt: photo.createdAt,
                        width: IMAGE_WIDTH_DEFAULT,
                        height: IMAGE_HEIGHT_DEFAULT,
                        src: `/api/getImage?imageName=${encodeURIComponent(
                            photo.name,
                        )}&folderName=${encodeURIComponent(selectedFolder)}`,
                    }),
                );

                setIsLoading(false);
                setPhotos(fetchedPhotos);
                setSortedPhotos(fetchedPhotos);
            } catch (error) {
                console.error('Lỗi khi tải ảnh:', error);
            }
        };

        if (selectedFolder) {
            loadPhotos(selectedFolder);
        } else {
            setIsLoading(false);
        }
    }, [selectedFolder]);

    useEffect(() => {
        if (folders?.length) {
            setSelectedFolder(folders[0].path);
        }
    }, [folders]);

    useEffect(() => {
        const sorted = [...photos].sort((a, b) => {
            let comparison = 0;

            if (sortField === 'name') {
                comparison = a.title!.localeCompare(b.title!);
            } else {
                comparison = a.createdAt - b.createdAt;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setCurrentPage(1);
        setSortedPhotos(sorted);
    }, [sortField, sortOrder, photos]);

    const handleAddFolder = (newFolders: Folder[]) => {
        const updatedFolders = [...(folders || []), ...newFolders];
        setFolders(updatedFolders);
    };

    const handleDeleteFolder = (path: string) => {
        if (!folders) {
            return;
        }

        const updatedFolders = folders.filter((folder) => folder.path !== path);
        setFolders(updatedFolders);
        message.success('Xóa thư mục thành công');

        if (selectedFolder === path) {
            setSelectedFolder(updatedFolders.length ? updatedFolders[0].path : undefined);
        }
    };

    const handleSelectFolder = (path: string) => {
        setSelectedFolder(path);
    };

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSortChange = (field: SortField, order: SortOrder) => {
        setSortField(field);
        setSortOrder(order);
    };

    const handleOpenAddFolder = () => {
        setOpenAddFolder(true);
    };

    const handleOpenAlbumFilters = () => {
        setOpenAlbumFilters(true);
    };

    const value = {
        photos,
        folders,
        selectedFolder,
        currentPage,
        itemsPerPage,
        sortField,
        sortOrder,
        sortedPhotos,
        slideShowDelay,
        handleSelectFolder,
        handleDeleteFolder,
        handleAddFolder,
        handleOpenAddFolder,
        handleOpenAlbumFilters,
        handlePageChange,
        handleItemsPerPageChange,
        handleSortChange,
    };

    if (isLoading) return <Loading />;

    return (
        <AlbumContext.Provider value={value}>
            <>
                {children}

                <CustomDrawer
                    open={openAddFolder}
                    title="Thêm thư mục"
                    onClose={() => setOpenAddFolder(false)}
                >
                    <AddFolder onAddFolder={handleAddFolder} />
                </CustomDrawer>

                <CustomDrawer
                    title="Lọc"
                    open={openAlbumFilters}
                    onClose={() => setOpenAlbumFilters(false)}
                >
                    <AlbumFilters
                        sortField={sortField}
                        sortOrder={sortOrder}
                        itemsPerPage={itemsPerPage}
                        slideShowDelay={slideShowDelay}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        onSortFieldChange={(value) => setSortField(value as SortField)}
                        onSortOrderChange={(value) => setSortOrder(value as SortOrder)}
                        onSlideShowDelayChange={(value) => setSlideShowDelay(Number(value))}
                    />

                    <Button
                        type="primary"
                        className="w-full mt-4"
                        onClick={() => setOpenAlbumFilters(false)}
                    >
                        Áp dụng
                    </Button>
                </CustomDrawer>
            </>
        </AlbumContext.Provider>
    );
};

export const useAlbumContext = () => {
    const context = useContext(AlbumContext);
    if (context === undefined) {
        throw new Error('useAlbum must be used within an AlbumProvider');
    }
    return context;
};
