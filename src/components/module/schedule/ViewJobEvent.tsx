'use client';

import { StatusTag } from '@/components/common';
import { CustomModal } from '@/components/custom';
import { NSchedule } from '@/interfaces';
import { calculateDuration, formatDate } from '@/libs';
import { Descriptions, Tabs } from 'antd';
import TabPane from 'antd/es/tabs/TabPane';
import { FC } from 'react';

type ViewJobEventProps = {
    isOpen: boolean;
    jobEvent: NSchedule.IScheduleJobEvent;
    onClose: () => void;
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
                            <StatusTag status={jobEvent.eventType} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Nội dung sự kiện">
                            {jobEvent.eventMessage ? jobEvent.eventMessage : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian tạo">
                            {formatDate(jobEvent.createdAt)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian bắt đầu">
                            {formatDate(jobEvent.startedAt)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian kết thúc">
                            {formatDate(jobEvent.finishedAt)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian thực hiện">
                            {calculateDuration(jobEvent.startedAt, jobEvent.finishedAt)}
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

export default ViewJobEvent;
