'use client';

import { Button, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { FC, memo } from 'react';

type DataNotFoundProps = {
    icon?: string;
    title?: string;
    message?: string;
    loading?: boolean;
    onRetry?: () => void;
};

const DataNotFound: FC<DataNotFoundProps> = ({
    icon = 'lucide:circle-off',
    title = 'Không có dữ liệu',
    message = 'Vui lòng kiểm tra kết nối hoặc thử lại sau.',
    loading,
    onRetry,
}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent">
            <Card className="max-w-xl w-full">
                <CardBody className="flex flex-col items-center gap-4 py-10">
                    <Icon icon={icon} className="text-5xl text-foreground-400" />
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-foreground-500 text-center">{message}</p>

                    {onRetry ? (
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
                    ) : (
                        <></>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default memo(DataNotFound);
