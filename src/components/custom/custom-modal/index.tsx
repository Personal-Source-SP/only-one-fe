'use client';

import { Modal, ModalProps } from 'antd';
import { FC, memo } from 'react';

type CustomModalProps = {
    modalProps: ModalProps;
    children: React.ReactNode;
};

const CustomModal: FC<CustomModalProps> = ({ children, modalProps }) => {
    if (!modalProps.open) return <></>;

    return (
        <Modal
            width={1200}
            footer={false}
            closable={false}
            style={{ top: 20 }}
            maskClosable={false}
            destroyOnClose={false}
            wrapClassName="fixed-modal"
            {...modalProps}
        >
            <section className="!max-h-[calc(100vh-200px)] !overflow-y-auto">{children}</section>
        </Modal>
    );
};

export default memo(CustomModal);
