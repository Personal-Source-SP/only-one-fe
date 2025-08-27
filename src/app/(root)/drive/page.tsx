'use client';

import FileDetails from '@/components/module/file-details';
import { Button, Card, Dropdown, Input, Table, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { FC, useEffect, useState } from 'react';

const DrivePage: FC = () => {
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [currentPath, setCurrentPath] = useState<string[]>(['My Drive']);
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    // Check if we're on mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            // Auto switch to card view on mobile
            if (window.innerWidth < 768 && viewMode === 'table') {
                setViewMode('card');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Check on initial render

        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]);

    // Mock data
    const files = [
        {
            id: '1',
            name: 'Tài liệu dự án',
            type: 'folder',
            owner: 'Bạn',
            modified: '10/05/2023',
            size: '-',
        },
        {
            id: '2',
            name: 'Báo cáo Q2 2023.docx',
            type: 'doc',
            owner: 'Bạn',
            modified: '15/05/2023',
            size: '2.4 MB',
        },
        {
            id: '3',
            name: 'Phân tích doanh thu.xlsx',
            type: 'sheet',
            owner: 'Hương Trần',
            modified: '20/05/2023',
            size: '1.8 MB',
        },
        {
            id: '4',
            name: 'Kế hoạch marketing.pdf',
            type: 'pdf',
            owner: 'Bạn',
            modified: '22/05/2023',
            size: '4.2 MB',
        },
        {
            id: '5',
            name: 'Thuyết trình dự án.pptx',
            type: 'slide',
            owner: 'Tuấn Nguyễn',
            modified: '25/05/2023',
            size: '8.7 MB',
        },
        {
            id: '6',
            name: 'Hình ảnh sản phẩm',
            type: 'folder',
            owner: 'Bạn',
            modified: '28/05/2023',
            size: '-',
        },
        {
            id: '7',
            name: 'Hợp đồng khách hàng.docx',
            type: 'doc',
            owner: 'Bạn',
            modified: '01/06/2023',
            size: '1.2 MB',
        },
        {
            id: '8',
            name: 'Dữ liệu khảo sát.xlsx',
            type: 'sheet',
            owner: 'Linh Đỗ',
            modified: '05/06/2023',
            size: '3.5 MB',
        },
    ];

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'folder':
                return <Icon icon="lucide:folder" className="text-xl text-warning" />;
            case 'doc':
                return <Icon icon="logos:google-docs" className="text-xl" />;
            case 'sheet':
                return <Icon icon="logos:google-sheets" className="text-xl" />;
            case 'slide':
                return <Icon icon="logos:google-slides" className="text-xl" />;
            case 'pdf':
                return <Icon icon="logos:adobe-acrobat-reader" className="text-xl" />;
            default:
                return <Icon icon="lucide:file" className="text-xl text-foreground-500" />;
        }
    };

    const handleRowAction = (file: any) => {
        if (file.type === 'folder') {
            setCurrentPath([...currentPath, file.name]);
        } else {
            setSelectedFile(file);
            setShowDetails(true);
        }
    };

    const handlePathClick = (index: number) => {
        setCurrentPath(currentPath.slice(0, index + 1));
    };

    const renderCell = (file: any, columnKey: React.Key) => {
        switch (columnKey) {
            case 'name':
                return (
                    <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <span className="font-medium">{file.name}</span>
                    </div>
                );
            case 'owner':
                return file.owner;
            case 'modified':
                return file.modified;
            case 'size':
                return file.size;
            case 'actions':
                return (
                    <div className="flex justify-end">
                        <Dropdown
                          menu={{
                            items: [
                              { key: 'view', label: 'Xem', icon: <Icon icon="lucide:eye" /> },
                              { key: 'download', label: 'Tải xuống', icon: <Icon icon="lucide:download" /> },
                              {
                                key: 'view-details',
                                label: 'Xem chi tiết',
                                icon: <Icon icon="lucide:info" />,
                              },
                              { type: 'divider' as const },
                              { key: 'open-in-drive', label: 'Mở trong Drive', icon: <Icon icon="lucide:external-link" /> },
                              { key: 'delete', label: 'Xóa', icon: <Icon icon="lucide:trash-2" />, danger: true },
                            ],
                            onClick: ({ key }) => {
                              if (key === 'view-details') {
                                setSelectedFile(file);
                                setShowDetails(true);
                              }
                            },
                          }}
                          trigger={["click"]}
                        >
                          <Button type="text" shape="circle" icon={<Icon icon="lucide:more-vertical" className="text-lg" />} />
                        </Dropdown>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Breadcrumbs */}
            <div className="flex items-center overflow-x-auto whitespace-nowrap pb-2">
                {currentPath.map((path, index) => (
                    <div key={index} className="breadcrumb-item">
                        <span
                            className={`cursor-pointer hover:text-primary ${
                                index === currentPath.length - 1 ? '' : 'hover:underline'
                            }`}
                            onClick={() => handlePathClick(index)}
                        >
                            {path}
                        </span>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="flex gap-2 flex-wrap">
                    <Input
                        placeholder="Tìm kiếm trong Drive..."
                        prefix={<Icon icon="lucide:search" className="text-foreground-500" />}
                        className="w-full sm:w-64"
                        size="small"
                    />
                    <Dropdown
                      menu={{
                        items: [
                          { key: 'all', label: 'Tất cả các tệp' },
                          { key: 'doc', label: 'Tài liệu' },
                          { key: 'sheet', label: 'Bảng tính' },
                          { key: 'slide', label: 'Thuyết trình' },
                          { key: 'pdf', label: 'PDF' },
                          { key: 'folder', label: 'Thư mục' },
                        ],
                      }}
                    >
                      <Button type="default" size="small">
                        Lọc <Icon icon="lucide:chevron-down" />
                      </Button>
                    </Dropdown>

                    {/* View toggle */}
                    <Button
                        type="default"
                        size="small"
                        icon={
                            <Icon
                                icon={viewMode === 'table' ? 'lucide:grid' : 'lucide:list'}
                                className="text-foreground-600"
                            />
                        }
                        onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                    >
                        {viewMode === 'table' ? 'Dạng thẻ' : 'Dạng bảng'}
                    </Button>
                </div>

                <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button type="primary" icon={<Icon icon="lucide:upload" />} size="small">
                        Tải lên
                    </Button>
                    <Button type="primary" ghost icon={<Icon icon="lucide:folder-plus" />} size="small">
                        Thư mục mới
                    </Button>
                </div>
            </div>

            {/* Files Table or Card View */}
            <div className="flex">
                <div className={`flex-1 transition-all ${showDetails ? 'pr-0 md:pr-4' : ''}`}>
                    {viewMode === 'table' ? (
                        <div className="overflow-x-auto">
                            <Table
                              rowSelection={{
                                selectedRowKeys: selectedKeys,
                                onChange: (keys) => setSelectedKeys(keys),
                              }}
                              pagination={false}
                              className="rounded-lg border border-divider min-w-full"
                              dataSource={files}
                              rowKey="id"
                              onRow={(record) => ({
                                onClick: () => handleRowAction(record as any),
                              })}
                            >
                              <Table.Column dataIndex="name" title="TÊN" key="name" render={(_, r) => renderCell(r, 'name')} />
                              {!isMobile ? (
                                <Table.Column dataIndex="owner" title="CHỦ SỞ HỮU" key="owner" render={(_, r) => renderCell(r, 'owner')} />
                              ) : null}
                              <Table.Column dataIndex="modified" title="NGÀY SỬA ĐỔI" key="modified" render={(_, r) => renderCell(r, 'modified')} />
                              {!isMobile ? (
                                <Table.Column dataIndex="size" title="KÍCH THƯỚC" key="size" render={(_, r) => renderCell(r, 'size')} />
                              ) : null}
                              <Table.Column dataIndex="actions" key="actions" render={(_, r) => renderCell(r, 'actions')} align="right" />
                            </Table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {files.map((file) => (
                                <Card
                                    key={file.id}
                                    className="hover:shadow-md transition-shadow"
                                    onClick={() => handleRowAction(file)}
                                >
                                    <div className="p-3">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(file.type)}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{file.name}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-xs text-foreground-500">
                                                        {file.modified}
                                                    </p>
                                                    <p className="text-xs text-foreground-500">
                                                        {file.size}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* File Details Sidebar */}
                {showDetails && (
                    <div
                        className={`${
                            isMobile
                                ? 'fixed inset-0 z-50 bg-background'
                                : 'w-80 border-l border-divider'
                        }`}
                    >
                        <FileDetails
                            file={selectedFile}
                            onClose={() => setShowDetails(false)}
                            isMobile={isMobile}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DrivePage;
