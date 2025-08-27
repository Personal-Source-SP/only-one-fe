'use client';

import { Avatar, Button, Card, Input, Table, Tag } from 'antd';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { FC, useEffect, useState } from 'react';
import DataNotFound from '@/components/common/data-not-found';

const UsersPage: FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    // Check if we're on mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // Auto switch to card view on mobile
            if (mobile && viewMode === 'table') {
                setViewMode('card');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Check on initial render

        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]);

    // Mock data
    const users = [
        {
            id: 1,
            name: 'Minh Nguyễn',
            email: 'minh.nguyen@example.com',
            role: 'Admin',
            joinDate: '15/01/2023',
            avatarId: 1,
        },
        {
            id: 2,
            name: 'Hương Trần',
            email: 'huong.tran@example.com',
            role: 'User',
            joinDate: '20/01/2023',
            avatarId: 2,
        },
        {
            id: 3,
            name: 'Tuấn Nguyễn',
            email: 'tuan.nguyen@example.com',
            role: 'User',
            joinDate: '25/01/2023',
            avatarId: 3,
        },
        {
            id: 4,
            name: 'Linh Đỗ',
            email: 'linh.do@example.com',
            role: 'User',
            joinDate: '01/02/2023',
            avatarId: 4,
        },
        {
            id: 5,
            name: 'Hùng Phạm',
            email: 'hung.pham@example.com',
            role: 'Admin',
            joinDate: '05/02/2023',
            avatarId: 5,
        },
        {
            id: 6,
            name: 'Mai Lê',
            email: 'mai.le@example.com',
            role: 'User',
            joinDate: '10/02/2023',
            avatarId: 6,
        },
        {
            id: 7,
            name: 'Dũng Vũ',
            email: 'dung.vu@example.com',
            role: 'User',
            joinDate: '15/02/2023',
            avatarId: 7,
        },
        {
            id: 8,
            name: 'Thảo Nguyễn',
            email: 'thao.nguyen@example.com',
            role: 'User',
            joinDate: '20/02/2023',
            avatarId: 8,
        },
    ];

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const renderCell = (user: any, columnKey: React.Key) => {
        switch (columnKey) {
            case 'name':
                return (
                    <div className="flex items-center gap-3">
                        <Avatar src={`https://img.heroui.chat/image/avatar?w=200&h=200&u=${user.avatarId}`} size="small" />
                        <span className="font-medium">{user.name}</span>
                    </div>
                );
            case 'email':
                return user.email;
            case 'role':
                return (
                    <Tag color={user.role === 'Admin' ? 'blue' : undefined}>{user.role}</Tag>
                );
            case 'joinDate':
                return user.joinDate;
            case 'actions':
                return (
                    <div className="flex justify-end gap-2">
                        <Button type="text" shape="circle" size="small">
                            <Icon icon="lucide:mail" className="text-lg text-foreground-600" />
                        </Button>
                        <Button type="text" shape="circle" size="small">
                            <Icon
                                icon="lucide:more-vertical"
                                className="text-lg text-foreground-600"
                            />
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!users || users.length === 0) {
        return (
            <DataNotFound
                title="Chưa có người dùng"
                message="Hãy thêm người dùng mới để hiển thị danh sách."
                icon="lucide:users"
            />
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                    <h1 className="text-2xl font-medium mb-1">Danh sách người dùng</h1>
                    <p className="text-foreground-600">
                        Quản lý người dùng trong hệ thống Google Hub
                    </p>
                </div>

                <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button type="primary" icon={<Icon icon="lucide:user-plus" />} size="small">
                        Thêm người dùng
                    </Button>

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
                        {!isMobile && (viewMode === 'table' ? 'Dạng thẻ' : 'Dạng bảng')}
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2">
                <Input
                    placeholder="Tìm theo tên hoặc email..."
                    prefix={<Icon icon="lucide:search" className="text-foreground-500" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64"
                    size="small"
                />

                <Button type="default" size="small" icon={<Icon icon="lucide:chevron-down" />}>
                    Vai trò
                </Button>

                <Button type="default" size="small" icon={<Icon icon="lucide:chevron-down" />}>
                    Ngày tham gia
                </Button>
            </div>

            {/* Users Table or Card View */}
            {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                    <Table
                      dataSource={filteredUsers}
                      rowKey="id"
                      pagination={false}
                      className="rounded-lg border border-divider min-w-full"
                    >
                      <Table.Column dataIndex="name" title="HỌ VÀ TÊN" key="name" render={(_, r) => renderCell(r, 'name')} />
                      {!isMobile ? (
                        <Table.Column dataIndex="email" title="EMAIL" key="email" render={(_, r) => renderCell(r, 'email')} />
                      ) : null}
                      <Table.Column dataIndex="role" title="VAI TRÒ" key="role" render={(_, r) => renderCell(r, 'role')} />
                      {!isMobile ? (
                        <Table.Column dataIndex="joinDate" title="NGÀY THAM GIA" key="joinDate" render={(_, r) => renderCell(r, 'joinDate')} />
                      ) : null}
                      <Table.Column key="actions" render={(_, r) => renderCell(r, 'actions')} align="right" />
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredUsers.map((user) => (
                        <Card key={user.id} className="p-4">
                            <div className="flex items-center gap-3">
                                <Avatar src={`https://img.heroui.chat/image/avatar?w=200&h=200&u=${user.avatarId}`} size={64} />
                                <div className="flex-1">
                                    <h3 className="font-medium">{user.name}</h3>
                                    <p className="text-sm text-foreground-500">{user.email}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <Tag color={user.role === 'Admin' ? 'blue' : undefined}>{user.role}</Tag>
                                        <p className="text-xs text-foreground-500">
                                            Tham gia: {user.joinDate}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-3">
                                <Button size="small" type="default" icon={<Icon icon="lucide:mail" />}>
                                    Liên hệ
                                </Button>
                                <Button size="small" type="text" shape="circle" icon={<Icon icon="lucide:more-vertical" />} />
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mt-6">
                <div className="bg-content1 p-4 rounded-lg border border-divider flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary-100 text-primary">
                        <Icon icon="lucide:users" className="text-xl" />
                    </div>
                    <div>
                        <p className="text-2xl font-medium">{users.length}</p>
                        <p className="text-sm text-foreground-500">Tổng số người dùng</p>
                    </div>
                </div>

                <div className="bg-content1 p-4 rounded-lg border border-divider flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary-100 text-primary">
                        <Icon icon="lucide:shield" className="text-xl" />
                    </div>
                    <div>
                        <p className="text-2xl font-medium">
                            {users.filter((u) => u.role === 'Admin').length}
                        </p>
                        <p className="text-sm text-foreground-500">Quản trị viên</p>
                    </div>
                </div>

                <div className="bg-content1 p-4 rounded-lg border border-divider flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary-100 text-primary">
                        <Icon icon="lucide:user" className="text-xl" />
                    </div>
                    <div>
                        <p className="text-2xl font-medium">
                            {users.filter((u) => u.role === 'User').length}
                        </p>
                        <p className="text-sm text-foreground-500">Người dùng thường</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default UsersPage;
