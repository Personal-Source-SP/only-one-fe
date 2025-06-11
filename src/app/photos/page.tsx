'use client';

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    useDisclosure,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { FC, useEffect, useState } from 'react';

const PhotosPage: FC = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Responsive grid columns
    const [columns, setColumns] = useState(4);

    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setColumns(2); // Mobile: 2 columns
            } else if (width < 1024) {
                setColumns(3); // Tablet: 3 columns
            } else {
                setColumns(4); // Desktop: 4+ columns
            }
        };

        window.addEventListener('resize', updateColumns);
        updateColumns(); // Initial check

        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // Mock data - photos grouped by date
    const photoGroups = [
        {
            date: 'Hôm nay',
            photos: [
                { id: 1, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=1' },
                { id: 2, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=2' },
                { id: 3, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=3' },
                { id: 4, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=4' },
            ],
        },
        {
            date: 'Tuần trước',
            photos: [
                { id: 5, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=5' },
                { id: 6, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=6' },
                { id: 7, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=7' },
                { id: 8, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=8' },
                { id: 9, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=9' },
                { id: 10, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=10' },
            ],
        },
        {
            date: 'Tháng trước',
            photos: [
                { id: 11, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=11' },
                { id: 12, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=12' },
                { id: 13, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=13' },
                { id: 14, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=14' },
                { id: 15, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=15' },
                { id: 16, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=16' },
                { id: 17, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=17' },
                { id: 18, url: 'https://img.heroui.chat/image/landscape?w=600&h=400&u=18' },
            ],
        },
    ];

    // Flatten photos for navigation in lightbox
    const allPhotos = photoGroups.flatMap((group) => group.photos);

    // Add new state for image editing
    const [isEditing, setIsEditing] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>('none');

    // Add filter options
    const filters = [
        { id: 'none', name: 'Gốc', preview: null },
        { id: 'grayscale', name: 'Đen trắng', preview: 'grayscale(100%)' },
        { id: 'sepia', name: 'Sepia', preview: 'sepia(100%)' },
        { id: 'saturate', name: 'Sống động', preview: 'saturate(200%)' },
        { id: 'contrast', name: 'Tương phản', preview: 'contrast(150%)' },
        { id: 'brightness', name: 'Sáng', preview: 'brightness(150%)' },
    ];

    const handlePhotoClick = (url: string) => {
        setSelectedPhoto(url);
        const index = allPhotos.findIndex((photo) => photo.url === url);
        setCurrentIndex(index);
        onOpen();
    };

    const handleEditPhoto = (url: string) => {
        setEditingPhoto(url);
        setIsEditing(true);
        setFilterType('none');
    };

    const handleSaveEdit = () => {
        // In a real app, this would save the edited image
        setIsEditing(false);
        setEditingPhoto(null);
    };

    const handlePrevious = () => {
        const newIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
        setCurrentIndex(newIndex);
        setSelectedPhoto(allPhotos[newIndex].url);
    };

    const handleNext = () => {
        const newIndex = (currentIndex + 1) % allPhotos.length;
        setCurrentIndex(newIndex);
        setSelectedPhoto(allPhotos[newIndex].url);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, scale: 0.9 },
        show: { opacity: 1, scale: 1 },
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <Input
                    placeholder="Tìm kiếm ảnh của bạn..."
                    startContent={<Icon icon="lucide:search" className="text-foreground-500" />}
                    className="w-full sm:w-64"
                    size="sm"
                />

                <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button color="primary" startContent={<Icon icon="lucide:upload" />} size="sm">
                        Tải ảnh lên
                    </Button>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<Icon icon="lucide:filter" />}
                                size="sm"
                            >
                                Lọc
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownItem key="all">Tất cả ảnh</DropdownItem>
                            <DropdownItem key="my">Ảnh của tôi</DropdownItem>
                            <DropdownItem key="shared">Ảnh được chia sẻ</DropdownItem>
                            <DropdownItem key="favorite">Ảnh yêu thích</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>

            {/* Photo Groups */}
            <div className="space-y-8">
                {photoGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-2">
                        <h2 className="text-lg font-medium">{group.date}</h2>
                        <motion.div
                            className={`grid grid-cols-${columns} gap-2`}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                            }}
                            variants={container}
                            initial="hidden"
                            animate="show"
                        >
                            {group.photos.map((photo) => (
                                <motion.div
                                    key={photo.id}
                                    className="aspect-[4/3] rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-all hover:shadow-md"
                                    variants={item}
                                    onClick={() => handlePhotoClick(photo.url)}
                                >
                                    <img
                                        src={photo.url}
                                        alt={`Photo ${photo.id}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="5xl"
                backdrop="blur"
                placement="center"
                hideCloseButton
                className="p-0 m-0 max-w-full sm:m-4 sm:max-w-5xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <ModalBody className="p-0 relative">
                            {selectedPhoto && (
                                <div className="relative">
                                    <img
                                        src={selectedPhoto}
                                        alt="Selected photo"
                                        className="w-full h-auto"
                                        style={{
                                            filter: isEditing
                                                ? filterType !== 'none'
                                                    ? filters.find((f) => f.id === filterType)
                                                          ?.preview || ''
                                                    : ''
                                                : '',
                                        }}
                                    />

                                    {/* Navigation Controls */}
                                    {!isEditing && (
                                        <div className="absolute inset-0 flex items-center justify-between p-2 sm:p-4">
                                            <Button
                                                isIconOnly
                                                color="default"
                                                variant="flat"
                                                radius="full"
                                                className="bg-black/30 text-white"
                                                onPress={handlePrevious}
                                            >
                                                <Icon
                                                    icon="lucide:chevron-left"
                                                    className="text-xl"
                                                />
                                            </Button>

                                            <Button
                                                isIconOnly
                                                color="default"
                                                variant="flat"
                                                radius="full"
                                                className="bg-black/30 text-white"
                                                onPress={handleNext}
                                            >
                                                <Icon
                                                    icon="lucide:chevron-right"
                                                    className="text-xl"
                                                />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Top Controls */}
                                    <div className="absolute top-0 right-0 p-2 sm:p-4 flex gap-2">
                                        {isEditing ? (
                                            <Button
                                                color="primary"
                                                variant="flat"
                                                radius="full"
                                                className="bg-black/30 text-white"
                                                onPress={handleSaveEdit}
                                            >
                                                <Icon
                                                    icon="lucide:check"
                                                    className="text-xl mr-1"
                                                />
                                                <span>Lưu</span>
                                            </Button>
                                        ) : (
                                            <Button
                                                color="default"
                                                variant="flat"
                                                radius="full"
                                                className="bg-black/30 text-white"
                                                onPress={() => handleEditPhoto(selectedPhoto)}
                                            >
                                                <Icon
                                                    icon="lucide:edit-3"
                                                    className="text-xl mr-1"
                                                />
                                                <span className="hidden sm:inline">Chỉnh sửa</span>
                                            </Button>
                                        )}
                                        <Button
                                            isIconOnly
                                            color="default"
                                            variant="flat"
                                            radius="full"
                                            className="bg-black/30 text-white"
                                            onPress={() => {
                                                setIsEditing(false);
                                                onClose();
                                            }}
                                        >
                                            <Icon icon="lucide:x" className="text-xl" />
                                        </Button>
                                    </div>

                                    {/* Bottom Controls */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 flex justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent">
                                        {isEditing ? (
                                            <div className="flex gap-2 overflow-x-auto pb-2 w-full justify-center">
                                                {filters.map((filter) => (
                                                    <Button
                                                        key={filter.id}
                                                        color={
                                                            filterType === filter.id
                                                                ? 'primary'
                                                                : 'default'
                                                        }
                                                        variant="flat"
                                                        radius="full"
                                                        className="bg-black/30 text-white min-w-[80px]"
                                                        size="sm"
                                                        onPress={() => setFilterType(filter.id)}
                                                    >
                                                        {filter.name}
                                                    </Button>
                                                ))}
                                            </div>
                                        ) : (
                                            <>
                                                <Button
                                                    color="default"
                                                    variant="flat"
                                                    radius="full"
                                                    className="bg-black/30 text-white"
                                                    startContent={<Icon icon="lucide:download" />}
                                                    size="sm"
                                                >
                                                    <span className="hidden sm:inline">
                                                        Tải xuống
                                                    </span>
                                                </Button>
                                                <Button
                                                    color="default"
                                                    variant="flat"
                                                    radius="full"
                                                    className="bg-black/30 text-white"
                                                    startContent={<Icon icon="lucide:share-2" />}
                                                    size="sm"
                                                >
                                                    <span className="hidden sm:inline">
                                                        Chia sẻ
                                                    </span>
                                                </Button>
                                                <Button
                                                    color="danger"
                                                    variant="flat"
                                                    radius="full"
                                                    className="bg-black/30 text-white"
                                                    startContent={<Icon icon="lucide:trash-2" />}
                                                    size="sm"
                                                >
                                                    <span className="hidden sm:inline">Xóa</span>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default PhotosPage;
