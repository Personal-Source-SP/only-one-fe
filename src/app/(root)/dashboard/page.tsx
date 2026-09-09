'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { CustomButton, CustomCard, CustomSpace } from '@/components/custom-antd';

import { activityData, recentFiles, recentNotes, recentPhotos, storageData } from './constants';
import { ActivityChart, StorageChart } from './components';

const DashboardPage = () => {
    return (
        <CustomSpace direction="vertical" className="space-y-6 w-full">
            <div>
                <h1 className="text-2xl font-medium mb-2">Chào buổi sáng, Minh Nguyễn!</h1>
                <p className="text-foreground-600">Đây là tổng quan hoạt động của bạn.</p>
            </div>

            <div>
                <CustomCard>
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-medium">Hoạt động 7 ngày qua</h2>
                    </div>
                    <div className="p-4">
                        <ActivityChart data={activityData} />
                    </div>
                </CustomCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2">
                    <CustomCard className="h-full">
                        <div className="flex justify-between items-center p-4 border-b">
                            <div className="flex items-center gap-2">
                                <Icon icon="logos:google-drive" className="text-xl" />
                                <h2 className="text-lg font-medium">Tệp Drive truy cập gần đây</h2>
                            </div>
                            <Link href="/drive">
                                <CustomButton type="link" size="small">
                                    Xem tất cả
                                </CustomButton>
                            </Link>
                        </div>
                        <div className="p-4">
                            <div className="space-y-2">
                                {recentFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center p-2 rounded-md hover:bg-content2 transition-colors"
                                    >
                                        <div className="mr-3">
                                            <Icon icon={file.icon} className="text-2xl" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-foreground-500">
                                                {file.modified}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <CustomButton
                                                type="text"
                                                shape="circle"
                                                icon={
                                                    <Icon icon="lucide:eye" className="text-lg" />
                                                }
                                            />
                                            <CustomButton
                                                type="text"
                                                shape="circle"
                                                icon={
                                                    <Icon
                                                        icon="lucide:download"
                                                        className="text-lg"
                                                    />
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CustomCard>
                </div>

                <div>
                    <CustomCard className="h-full">
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-medium">Dung lượng lưu trữ</h2>
                        </div>
                        <div className="p-4">
                            <StorageChart data={storageData} total="16 GB" />
                        </div>
                    </CustomCard>
                </div>

                <div className="lg:col-span-2">
                    <CustomCard>
                        <div className="flex justify-between items-center p-4 border-b">
                            <div className="flex items-center gap-2">
                                <Icon icon="logos:google-keep" className="text-xl" />
                                <h2 className="text-lg font-medium">Ghi chú Keep gần đây</h2>
                            </div>
                            <Link href="/keep">
                                <CustomButton type="link" size="small">
                                    Xem tất cả
                                </CustomButton>
                            </Link>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {recentNotes.map((note) => (
                                    <div
                                        key={note.id}
                                        className="rounded-md border border-divider p-3 hover:shadow-sm transition-shadow cursor-pointer"
                                        style={{ backgroundColor: note.color }}
                                    >
                                        <h3 className="font-medium mb-1 line-clamp-1">
                                            {note.title}
                                        </h3>
                                        <p className="text-sm text-foreground-700 line-clamp-3 mb-2">
                                            {note.content}
                                        </p>
                                        <p className="text-xs text-foreground-500">
                                            {note.modified}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CustomCard>
                </div>

                <div className="lg:col-span-3">
                    <CustomCard>
                        <div className="flex justify-between items-center p-4 border-b">
                            <div className="flex items-center gap-2">
                                <Icon icon="logos:google-photos" className="text-xl" />
                                <h2 className="text-lg font-medium">Ảnh mới nhất trên Photos</h2>
                            </div>
                            <Link href="/photos">
                                <CustomButton type="link" size="small">
                                    Xem tất cả
                                </CustomButton>
                            </Link>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {recentPhotos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        className="aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                    >
                                        <img
                                            src={photo.url}
                                            alt="Recent photo"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CustomCard>
                </div>
            </div>
        </CustomSpace>
    );
};

export default DashboardPage;
