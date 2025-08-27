import { Modal } from 'antd';
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
        <Modal title={title} open={!!open} onCancel={onClose} footer={null} width={width} centered>
            {children}
        </Modal>
    );
};

export default memo(CustomDrawer);
