'use client';

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Modal,
    ModalBody,
    ModalContent,
    Tooltip,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { memo, FC } from 'react';

export type SlideshowModalProps = {
    isOpen: boolean;
    selectedPhoto: string | null;
    currentIndex: number;
    total: number;
    onPrevious: () => void;
    onNext: () => void;
    stopSlideshow: () => void;
    slideshowInterval: number;
    onSetInterval: (seconds: number) => void;
    paused: boolean;
    onTogglePause: () => void;
};

const SlideshowModal: FC<SlideshowModalProps> = ({
    isOpen,
    selectedPhoto,
    currentIndex,
    total,
    onPrevious,
    onNext,
    stopSlideshow,
    slideshowInterval,
    onSetInterval,
    paused,
    onTogglePause,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) stopSlideshow();
            }}
            size="full"
            hideCloseButton
        >
            <ModalContent>
                {() => (
                    <ModalBody className="p-0 relative">
                        {selectedPhoto && (
                            <div className="relative h-screen flex items-center justify-center bg-black">
                                <img
                                    src={selectedPhoto}
                                    alt="Slideshow"
                                    className="max-h-full max-w-full object-contain"
                                />

                                <div className="absolute inset-0 flex flex-col opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <div className="p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                                        <div className="text-white text-lg">
                                            Trình chiếu ({currentIndex + 1}/{total})
                                        </div>
                                        <div className="flex gap-2">
                                            <Tooltip content="Tùy chọn trình chiếu">
                                                <Dropdown>
                                                    <DropdownTrigger>
                                                        <Button
                                                            isIconOnly
                                                            variant="flat"
                                                            radius="full"
                                                            className="bg-black/30 text-white"
                                                        >
                                                            <Icon icon="lucide:settings" />
                                                        </Button>
                                                    </DropdownTrigger>
                                                    <DropdownMenu aria-label="Slideshow settings">
                                                        <DropdownItem
                                                            key="2"
                                                            onPress={() => onSetInterval(2)}
                                                        >
                                                            2 giây
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="5"
                                                            onPress={() => onSetInterval(5)}
                                                        >
                                                            5 giây
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="10"
                                                            onPress={() => onSetInterval(10)}
                                                        >
                                                            10 giây
                                                        </DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </Tooltip>
                                            <Tooltip content="Thoát trình chiếu">
                                                <Button
                                                    isIconOnly
                                                    variant="flat"
                                                    radius="full"
                                                    className="bg-black/30 text-white"
                                                    onPress={stopSlideshow}
                                                >
                                                    <Icon icon="lucide:x" />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex items-center justify-between p-4">
                                        <Button
                                            isIconOnly
                                            variant="flat"
                                            radius="full"
                                            className="bg-black/30 text-white"
                                            onPress={onPrevious}
                                        >
                                            <Icon icon="lucide:chevron-left" className="text-2xl" />
                                        </Button>
                                        <Button
                                            isIconOnly
                                            variant="flat"
                                            radius="full"
                                            className="bg-black/30 text-white"
                                            onPress={onNext}
                                        >
                                            <Icon
                                                icon="lucide:chevron-right"
                                                className="text-2xl"
                                            />
                                        </Button>
                                    </div>

                                    <div className="p-4 flex justify-center bg-gradient-to-t from-black/50 to-transparent">
                                        <Button
                                            variant="flat"
                                            radius="full"
                                            className="bg-black/30 text-white"
                                            onPress={onTogglePause}
                                            startContent={
                                                <Icon
                                                    icon={paused ? 'lucide:play' : 'lucide:pause'}
                                                />
                                            }
                                        >
                                            {paused ? 'Tiếp tục' : 'Tạm dừng'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ModalBody>
                )}
            </ModalContent>
        </Modal>
    );
};

export default memo(SlideshowModal);
