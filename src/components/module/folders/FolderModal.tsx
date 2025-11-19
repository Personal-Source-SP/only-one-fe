'use client';

import { CustomModal } from '@/components/custom';
import { useCustomModal } from '@/hooks';
import { Option } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button, Col, Form, Input, Row, Select, Space, Spin } from 'antd';
import { FC } from 'react';

type FolderModalProps = {
    folderOptions: Option[];
    modalPropsData: ReturnType<typeof useCustomModal>;
    onSubmit: () => void;
    onClose?: () => void;
};

const FieldsEnum = {
    Name: 'name',
    ParentFolderId: 'parentFolderId',
};

const FolderModal: FC<FolderModalProps> = ({
    folderOptions,
    modalPropsData,
    onSubmit,
    onClose,
}) => {
    const { open, modalProps, formProps, formLoading, close } = modalPropsData;

    return (
        <CustomModal
            modalProps={{
                ...modalProps,
                open,
                width: 720,
                centered: true,
                closable: true,
                title: 'Chỉnh sửa thư mục',
                onCancel: onClose ?? close,
            }}
        >
            <Spin spinning={formLoading}>
                <Space direction="vertical" className="w-full h-full px-3 overflow-x-hidden">
                    <Form
                        {...formProps}
                        layout="vertical"
                        onFinish={onSubmit}
                        className="[&_.ant-form-item]:!mb-2"
                    >
                        <Row gutter={[16, 8]}>
                            <Col span={24}>
                                <Form.Item
                                    label="Tên thư mục"
                                    name={FieldsEnum.Name}
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập tên thư mục' },
                                    ]}
                                >
                                    <Input placeholder="Tên thư mục" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label="Thư mục" name={FieldsEnum.ParentFolderId}>
                                    <Select
                                        allowClear
                                        showSearch
                                        placeholder="Thư mục cha"
                                        options={folderOptions?.filter(
                                            (item) => item.value !== formProps.initialValues?.id,
                                        )}
                                        filterOption={(input, option) =>
                                            (option?.label ?? '')
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                    />
                                </Form.Item>
                            </Col>

                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full"
                                icon={<Icon icon="lucide:x" />}
                            >
                                <span>Chỉnh sửa</span>
                            </Button>
                        </Row>
                    </Form>
                </Space>
            </Spin>
        </CustomModal>
    );
};

export default FolderModal;
