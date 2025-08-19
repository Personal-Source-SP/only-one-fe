'use client';

import { Button, Modal, ModalBody, ModalContent } from '@heroui/react';
import { Icon } from '@iconify/react';
import { memo, FC } from 'react';

export type LightboxModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedPhoto: string | null;
    onRequestClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
};

const LightboxModal: FC<LightboxModalProps> = ({
    isOpen,
    onOpenChange,
    selectedPhoto,
    onRequestClose,
    onPrevious,
    onNext,
}) => {
    return (
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
                                        color="default"
                                        variant="flat"
                                        radius="full"
                                        className="bg-black/30 text-white"
                                        onPress={onPrevious}
                                    >
                                        <Icon icon="lucide:chevron-left" className="text-xl" />
                                    </Button>
                                    <Button
                                        isIconOnly
                                        color="default"
                                        variant="flat"
                                        radius="full"
                                        className="bg-black/30 text-white"
                                        onPress={onNext}
                                    >
                                        <Icon icon="lucide:chevron-right" className="text-xl" />
                                    </Button>
                                </div>

                                <div className="absolute top-0 right-0 p-2 sm:p-4 flex gap-2">
                                    <Button
                                        isIconOnly
                                        color="default"
                                        variant="flat"
                                        radius="full"
                                        className="bg-black/30 text-white"
                                        onPress={onRequestClose}
                                    >
                                        <Icon icon="lucide:x" className="text-xl" />
                                    </Button>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 flex justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent">
                                    <Button
                                        color="default"
                                        variant="flat"
                                        radius="full"
                                        className="bg-black/30 text-white"
                                        startContent={<Icon icon="lucide:download" />}
                                        size="sm"
                                    >
                                        <span className="hidden sm:inline">Tải xuống</span>
                                    </Button>
                                    <Button
                                        color="default"
                                        variant="flat"
                                        radius="full"
                                        className="bg-black/30 text-white"
                                        startContent={<Icon icon="lucide:share-2" />}
                                        size="sm"
                                    >
                                        <span className="hidden sm:inline">Chia sẻ</span>
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
