'use client';

import { CustomModal } from '@/components/custom';
import { ScheduleJobEventType } from '@/enums';
import { NSchedule } from '@/interfaces';
import { Descriptions, Tabs, Tag } from 'antd';
import TabPane from 'antd/es/tabs/TabPane';
import dayjs from 'dayjs';
import { FC, memo } from 'react';

type ViewJobEventProps = {
    isOpen: boolean;
    jobEvent: NSchedule.IScheduleJobEvent;
    onClose: () => void;
};

const statusColors: Record<string, string> = {
    pending: 'blue',
    processing: 'orange',
    completed: 'green',
    failed: 'red',
};

export const renderEventTypeName = (eventType: ScheduleJobEventType) => {
    let name = '';
    switch (eventType) {
        case ScheduleJobEventType.PENDING:
            name = 'Chờ xử lý';
            break;
        case ScheduleJobEventType.PROCESSING:
            name = 'Đang xử lý';
            break;
        case ScheduleJobEventType.COMPLETED:
            name = 'Hoàn thành';
            break;
        case ScheduleJobEventType.FAILED:
            name = 'Thất bại';
            break;
        default:
            name = 'Không xác định';
            break;
    }

    return <Tag color={statusColors[eventType]}>{name}</Tag>;
};

const ViewJobEvent: FC<ViewJobEventProps> = ({ isOpen, jobEvent, onClose }) => {
    return (
        <CustomModal
            modalProps={{
                width: 700,
                open: isOpen,
                closable: true,
                centered: true,
                onCancel: onClose,
                title: 'Xem sự kiện lịch biểu thực thi',
            }}
        >
            <Tabs defaultActiveKey="details">
                <TabPane tab="Chi tiết" key="details">
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Loại sự kiện">
                            {renderEventTypeName(jobEvent.eventType)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nội dung sự kiện">
                            {jobEvent.eventMessage ? jobEvent.eventMessage : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian tạo">
                            {jobEvent.createdAt
                                ? new Date(jobEvent.createdAt).toLocaleString()
                                : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian bắt đầu">
                            {jobEvent.startedAt
                                ? new Date(jobEvent.startedAt).toLocaleString()
                                : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian kết thúc">
                            {jobEvent.finishedAt
                                ? new Date(jobEvent.finishedAt).toLocaleString()
                                : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian thực hiện">
                            {jobEvent.startedAt && jobEvent.finishedAt
                                ? dayjs(jobEvent.finishedAt)
                                      .diff(jobEvent.startedAt, 'second')
                                      .toString()
                                      .concat(' giây')
                                : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số lần thử">
                            {jobEvent.retryCount ? `${jobEvent.retryCount} lần` : '-'}
                        </Descriptions.Item>
                    </Descriptions>
                </TabPane>
                <TabPane tab="Nội dung xử lý" key="payload">
                    <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 4 }}>
                        {JSON.stringify(jobEvent.payload, null, 2)}
                    </pre>
                </TabPane>
                <TabPane tab="Kết quả" key="metaData">
                    <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 4 }}>
                        {JSON.stringify(jobEvent.metaData, null, 2)}
                    </pre>
                </TabPane>
            </Tabs>
        </CustomModal>
    );
};

export default memo(ViewJobEvent);
