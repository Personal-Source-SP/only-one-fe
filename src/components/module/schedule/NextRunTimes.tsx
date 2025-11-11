import { Card, Col, Row, Tag, Typography } from 'antd';
import { CronExpressionParser } from 'cron-parser';
import { FC, Fragment, memo } from 'react';

const getNextRunTimes = (cron: string, count = 6) => {
    try {
        const interval = CronExpressionParser.parse(cron);
        const nextRunTimes = [];

        for (let i = 0; i < count; i++) {
            const nextDate = interval.next().toDate();
            nextRunTimes.push(nextDate.toLocaleString('en-US'));
        }

        return nextRunTimes;
    } catch (error) {
        console.error('Error parsing cron expression:', error);
        return [];
    }
};

type NextRunTimesProps = {
    cron?: string;
    count?: number;
};

const NextRunTimes: FC<NextRunTimesProps> = ({ cron, count = 6 }) => {
    if (!cron) return <Fragment></Fragment>;

    const nextRunTimes = getNextRunTimes(cron, count);

    return (
        <Card title={`${count} lần chạy gần nhất`} size="small">
            {nextRunTimes.length > 0 ? (
                <Row gutter={[8, 8]}>
                    {nextRunTimes.map((time, idx) => (
                        <Col span={8} key={idx}>
                            <Tag key={idx} color="blue">
                                {time}
                            </Tag>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Typography.Text type="secondary">Biểu thức cron không hợp lệ</Typography.Text>
            )}
        </Card>
    );
};

export default memo(NextRunTimes);
