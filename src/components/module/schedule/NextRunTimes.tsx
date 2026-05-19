import { CustomCard, CustomCol, CustomRow, CustomTag, CustomTypography } from '@/components/custom';
import { CronExpressionParser } from 'cron-parser';
import { Fragment } from 'react';

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

export const NextRunTimes = ({ cron, count = 6 }: NextRunTimesProps) => {
    if (!cron) return <Fragment></Fragment>;

    const nextRunTimes = getNextRunTimes(cron, count);

    return (
        <CustomCard title={`${count} lần chạy gần nhất`} size="small">
            {nextRunTimes.length > 0 ? (
                <CustomRow gutter={[8, 8]}>
                    {nextRunTimes.map((time, idx) => (
                        <CustomCol span={8} key={idx}>
                            <CustomTag key={idx} color="blue">
                                {time}
                            </CustomTag>
                        </CustomCol>
                    ))}
                </CustomRow>
            ) : (
                <CustomTypography.Text type="secondary">
                    Biểu thức cron không hợp lệ
                </CustomTypography.Text>
            )}
        </CustomCard>
    );
};
