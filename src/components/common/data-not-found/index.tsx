'use client';

import { Button, Card } from 'antd';
import { Icon } from '@iconify/react';


type DataNotFoundProps = {
    icon?: string;
    title?: string;
    message?: string;
    loading?: boolean;
    onRetry?: () => void;
};

const DataNotFound = ({
    icon = 'lucide:circle-off',
    title = 'Không có dữ liệu',
    message = 'Vui lòng kiểm tra kết nối hoặc thử lại sau.',
    loading,
    onRetry,
}: DataNotFoundProps) => {
    return (
        <div className="flex items-center justify-center bg-transparent">
            <Card className="max-w-xl w-full mx-4">
                <div className="flex flex-col items-center gap-4 py-10">
                    <Icon icon={icon} className="text-5xl text-foreground-400" />
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-foreground-500 text-center">{message}</p>

                    {onRetry ? (
                        <div className="flex gap-3">
                            <Button type="primary" loading={!!loading} onClick={onRetry}>
                                <span className="inline-flex items-center">
                                    <Icon icon="lucide:refresh-ccw" className="mr-2" /> Thử lại
                                </span>
                            </Button>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DataNotFound;
