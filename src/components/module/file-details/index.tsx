import { Avatar, Button, Card } from 'antd';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { FC, memo, useState } from 'react';

type FileDetailsProps = {
    file: any;
    onClose: () => void;
    isMobile?: boolean;
};

const FileDetails: FC<FileDetailsProps> = ({ file, onClose, isMobile = false }) => {
    const [activeTab, setActiveTab] = useState('details');

    if (!file) return null;

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'folder':
                return <Icon icon="lucide:folder" className="text-4xl text-warning" />;
            case 'doc':
                return <Icon icon="logos:google-docs" className="text-4xl" />;
            case 'sheet':
                return <Icon icon="logos:google-sheets" className="text-4xl" />;
            case 'slide':
                return <Icon icon="logos:google-slides" className="text-4xl" />;
            case 'pdf':
                return <Icon icon="logos:adobe-acrobat-reader" className="text-4xl" />;
            default:
                return <Icon icon="lucide:file" className="text-4xl text-foreground-500" />;
        }
    };

    // Add file version history
    const fileVersions = [
        { version: 'v3', date: '22/05/2023 15:30', user: 'Bạn' },
        { version: 'v2', date: '21/05/2023 10:15', user: 'Hương Trần' },
        { version: 'v1', date: '20/05/2023 09:45', user: 'Bạn' },
    ];

    // Add file sharing info
    const sharedWith = [
        {
            name: 'Hương Trần',
            email: 'huong.tran@example.com',
            access: 'Chỉnh sửa',
            avatarId: '2',
        },
        {
            name: 'Tuấn Nguyễn',
            email: 'tuan.nguyen@example.com',
            access: 'Xem',
            avatarId: '3',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isMobile ? 0 : 20 }}
            className="h-full"
        >
            <Card
                className="h-full rounded-none shadow-none"
                title={<h3 className="text-lg font-medium">Chi tiết</h3>}
                extra={
                    <Button
                        shape="circle"
                        type="text"
                        size="small"
                        onClick={onClose}
                        icon={<Icon icon="lucide:x" className="text-lg" />}
                    />
                }
            >
                {/* Add tabs for different sections */}
                <div className="px-4 border-b border-divider">
                    <div className="flex space-x-4">
                        <button
                            className={`py-2 px-1 text-sm ${
                                activeTab === 'details'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-foreground-600'
                            }`}
                            onClick={() => setActiveTab('details')}
                        >
                            Chi tiết
                        </button>
                        <button
                            className={`py-2 px-1 text-sm ${
                                activeTab === 'activity'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-foreground-600'
                            }`}
                            onClick={() => setActiveTab('activity')}
                        >
                            Hoạt động
                        </button>
                        <button
                            className={`py-2 px-1 text-sm ${
                                activeTab === 'sharing'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-foreground-600'
                            }`}
                            onClick={() => setActiveTab('sharing')}
                        >
                            Chia sẻ
                        </button>
                    </div>
                </div>

                <div className="space-y-6 overflow-y-auto">
                    {activeTab === 'details' && (
                        <>
                            <div className="flex flex-col items-center gap-3 py-4">
                                {getFileIcon(file.type)}
                                <h4 className="text-lg font-medium text-center">{file.name}</h4>
                                <p className="text-sm text-foreground-500">{file.size}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-foreground-500 mb-1">Chủ sở hữu</p>
                                    <div className="flex items-center gap-2">
                                        <Avatar
                                            src={
                                                file.owner === 'Bạn'
                                                    ? 'https://img.heroui.chat/image/avatar?w=200&h=200&u=1'
                                                    : `https://img.heroui.chat/image/avatar?w=200&h=200&u=${file.id}`
                                            }
                                            size="small"
                                        />
                                        <span>{file.owner}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-foreground-500 mb-1">
                                        Sửa đổi lần cuối
                                    </p>
                                    <p>{file.modified}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-foreground-500 mb-1">Vị trí</p>
                                    <p>My Drive</p>
                                </div>

                                {file.type !== 'folder' && (
                                    <div>
                                        <p className="text-sm text-foreground-500 mb-1">Loại tệp</p>
                                        <p>{file.type.toUpperCase()}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'activity' && (
                        <div className="space-y-4">
                            <h4 className="font-medium">Lịch sử phiên bản</h4>
                            <div className="space-y-3">
                                {fileVersions.map((version, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start p-2 rounded-md hover:bg-content2"
                                    >
                                        <div className="p-2 rounded-full bg-primary-100 text-primary mr-3">
                                            <Icon icon="lucide:history" className="text-lg" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{version.version}</p>
                                            <p className="text-xs text-foreground-500">
                                                {version.date} bởi {version.user}
                                            </p>
                                        </div>
                                        <Button
                                            shape="circle"
                                            type="text"
                                            size="small"
                                            className="ml-auto"
                                            icon={
                                                <Icon
                                                    icon="lucide:download"
                                                    className="text-foreground-600"
                                                />
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'sharing' && (
                        <div className="space-y-4">
                            <h4 className="font-medium">Người có quyền truy cập</h4>
                            <div className="space-y-3">
                                {sharedWith.map((person, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center p-2 rounded-md hover:bg-content2"
                                    >
                                        <Avatar
                                            src={`https://img.heroui.chat/image/avatar?w=200&h=200&u=${person.avatarId}`}
                                            size="small"
                                            className="mr-3"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium">{person.name}</p>
                                            <p className="text-xs text-foreground-500">
                                                {person.email}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-xs mr-2">{person.access}</span>
                                            <Button
                                                shape="circle"
                                                type="text"
                                                size="small"
                                                icon={
                                                    <Icon
                                                        icon="lucide:more-vertical"
                                                        className="text-foreground-600"
                                                    />
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    type="primary"
                                    ghost
                                    icon={<Icon icon="lucide:user-plus" />}
                                    block
                                    size="small"
                                >
                                    Thêm người
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 pt-4 mt-auto">
                        <Button type="primary" ghost icon={<Icon icon="lucide:download" />} block>
                            Tải xuống
                        </Button>
                        <Button type="primary" icon={<Icon icon="lucide:external-link" />} block>
                            Mở trong Drive
                        </Button>

                        {isMobile && (
                            <Button
                                type="text"
                                icon={<Icon icon="lucide:arrow-left" />}
                                block
                                onClick={onClose}
                                className="mt-2"
                            >
                                Quay lại
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default memo(FileDetails);
