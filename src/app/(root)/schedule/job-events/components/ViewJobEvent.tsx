'use client';

import type { IScheduleJobEvent } from '@/app/(root)/schedule/job-events/types';
import { CustomDescriptions, CustomModal, CustomTabs } from '@/components';
import { StatusTag } from '@/components';
import { calculateDuration, formatDate } from '@/libs';

type ViewJobEventProps = {
    isOpen: boolean;
    jobEvent: IScheduleJobEvent;
    onClose: () => void;
};

export const ViewJobEvent = ({ isOpen, jobEvent, onClose }: ViewJobEventProps) => {
    const tabItems = [
        {
            key: 'details',
            label: 'Chi tiết',
            children: (
                <CustomDescriptions column={1} bordered size="small">
                    <CustomDescriptions.Item label="Loại sự kiện">
                        <StatusTag status={jobEvent.eventType} />
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Nội dung sự kiện">
                        {jobEvent.eventMessage ? jobEvent.eventMessage : '-'}
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Thời gian tạo">
                        {formatDate(jobEvent.createdAt)}
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Thời gian bắt đầu">
                        {formatDate(jobEvent.startedAt)}
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Thời gian kết thúc">
                        {formatDate(jobEvent.finishedAt)}
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Thời gian thực hiện">
                        {calculateDuration(jobEvent.startedAt, jobEvent.finishedAt)}
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Số lần thử">
                        {jobEvent.retryCount ? `${jobEvent.retryCount} lần` : '-'}
                    </CustomDescriptions.Item>
                </CustomDescriptions>
            ),
        },
        {
            key: 'payload',
            label: 'Nội dung xử lý',
            children: (
                <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 4 }}>
                    {JSON.stringify(jobEvent.payload, null, 2)}
                </pre>
            ),
        },
        {
            key: 'metaData',
            label: 'Kết quả',
            children: (
                <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 4 }}>
                    {JSON.stringify(jobEvent.metaData, null, 2)}
                </pre>
            ),
        },
    ];

    return (
        <CustomModal
            width={700}
            open={isOpen}
            closable
            centered
            onCancel={onClose}
            title="Xem sự kiện lịch biểu thực thi"
        >
            <CustomTabs defaultActiveKey="details" items={tabItems} />
        </CustomModal>
    );
};
