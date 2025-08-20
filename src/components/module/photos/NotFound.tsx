'use client';

import { Button, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { FC, memo } from 'react';

export type PhotosNotFoundProps = {
    loading?: boolean;
    onRetry?: () => void;
};

const PhotosNotFound: FC<PhotosNotFoundProps> = ({ loading, onRetry }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent">
            <Card className="max-w-xl w-full">
                <CardBody className="flex flex-col items-center gap-4 py-10">
                    <Icon icon="lucide:image-off" className="text-5xl text-foreground-400" />
                    <h2 className="text-xl font-semibold">Không thể tải ảnh</h2>
                    <p className="text-foreground-500 text-center">
                        Vui lòng kiểm tra kết nối hoặc quyền truy cập Google Drive rồi thử lại.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="flat"
                            color="primary"
                            onPress={onRetry}
                            isLoading={!!loading}
                            startContent={<Icon icon="lucide:refresh-ccw" />}
                        >
                            Thử lại
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default memo(PhotosNotFound);
