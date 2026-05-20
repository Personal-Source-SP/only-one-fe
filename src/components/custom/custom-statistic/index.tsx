'use client';

import { Statistic, StatisticProps } from 'antd';
import { ReactNode } from 'react';

type CustomStatisticProps = StatisticProps;

type CustomStatisticGroupProps = {
    children: ReactNode;
    className?: string;
};

export type { CustomStatisticProps };

export const CustomStatistic = Object.assign(
    (props: CustomStatisticProps) => <Statistic {...props} />,
    {
        Countdown: Statistic.Countdown,
        Group: ({ children, className }: CustomStatisticGroupProps) => (
            <div
                className={['grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4', className]
                    .filter(Boolean)
                    .join(' ')}
            >
                {children}
            </div>
        ),
    },
);
