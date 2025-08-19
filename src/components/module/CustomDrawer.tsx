import { Modal, ModalBody, ModalContent } from '@heroui/react';
import React, { memo, ReactNode } from 'react';

interface CustomDrawerProps {
    title: string;
    children: ReactNode;
    onClose: () => void;
    open?: boolean;
    width?: number;
    placement?: 'right' | 'left';
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
    title,
    children,
    onClose,
    width = 378,
    placement = 'right',
    open,
}) => {
    return (
        <Modal
            isOpen={!!open}
            onOpenChange={(isOpen) => {
                if (!isOpen) onClose();
            }}
            placement="center"
            size="lg"
        >
            <ModalContent>
                {() => (
                    <ModalBody className="p-0">
                        <header className="px-4 py-3 border-b font-medium">{title}</header>
                        <section className="p-4" style={{ width }}>
                            {children}
                        </section>
                    </ModalBody>
                )}
            </ModalContent>
        </Modal>
    );
};

export default memo(CustomDrawer);
