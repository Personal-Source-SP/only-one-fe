'use client';

import { Button, Modal, ModalBody, ModalContent } from '@heroui/react';
import { Icon } from '@iconify/react';
import { FC, memo } from 'react';

export type LightboxModalProps = {
    isOpen: boolean;
    selectedPhoto: string | null;
    onNext: () => void;
    onPrevious: () => void;
    onRequestClose: () => void;
    onOpenChange: (open: boolean) => void;
};

const LightboxModal: FC<LightboxModalProps> = ({
    isOpen,
    selectedPhoto,
    onNext,
    onPrevious,
    onRequestClose,
    onOpenChange,
}) => {
    return (
        <Modal
            size="5xl"
            isOpen={isOpen}
            hideCloseButton
            backdrop="blur"
            placement="center"
            onOpenChange={onOpenChange}
            className="p-0 m-0 max-w-full sm:m-4 sm:max-w-5xl"
        >
            <ModalContent>
                {() => (
                    <ModalBody className="p-0 relative">
                        {selectedPhoto && (
                            <div className="relative">
                                <img
                                    src={selectedPhoto}
                                    alt="Selected photo"
                                    className="w-full h-auto"
                                />

                                <div className="absolute inset-0 flex items-center justify-between p-2 sm:p-4">
                                    <Button
                                        isIconOnly
                                        radius="full"
                                        variant="flat"
                                        color="default"
                                        onPress={onPrevious}
                                        className="bg-black/30 text-white"
                                    >
                                        <Icon icon="lucide:chevron-left" className="text-xl" />
                                    </Button>
                                    <Button
                                        isIconOnly
                                        radius="full"
                                        variant="flat"
                                        color="default"
                                        onPress={onNext}
                                        className="bg-black/30 text-white"
                                    >
                                        <Icon icon="lucide:chevron-right" className="text-xl" />
                                    </Button>
                                </div>

                                <div className="absolute top-0 right-0 p-2 sm:p-4 flex gap-2">
                                    <Button
                                        isIconOnly
                                        radius="full"
                                        variant="flat"
                                        color="default"
                                        onPress={onRequestClose}
                                        className="bg-black/30 text-white"
                                    >
                                        <Icon icon="lucide:x" className="text-xl" />
                                    </Button>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 flex justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent">
                                    <Button
                                        size="sm"
                                        radius="full"
                                        variant="flat"
                                        color="default"
                                        className="bg-black/30 text-white"
                                        startContent={<Icon icon="lucide:download" />}
                                    >
                                        <span className="hidden sm:inline">Tải xuống</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        radius="full"
                                        variant="flat"
                                        color="default"
                                        className="bg-black/30 text-white"
                                        startContent={<Icon icon="lucide:share-2" />}
                                    >
                                        <span className="hidden sm:inline">Chia sẻ</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        radius="full"
                                        variant="flat"
                                        color="danger"
                                        className="bg-black/30 text-white"
                                        startContent={<Icon icon="lucide:trash-2" />}
                                    >
                                        <span className="hidden sm:inline">Xóa</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </ModalBody>
                )}
            </ModalContent>
        </Modal>
    );
};

export default memo(LightboxModal);
