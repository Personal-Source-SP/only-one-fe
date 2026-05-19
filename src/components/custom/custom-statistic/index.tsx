'use client';

import { Statistic, StatisticProps } from 'antd';

export type CustomStatisticProps = StatisticProps;

export const CustomStatistic = Object.assign(
    (props: CustomStatisticProps) => <Statistic {...props} />,
    {
        Countdown: Statistic.Countdown,
    },
);
