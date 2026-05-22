'use client';

import { Statistic, StatisticProps } from 'antd';
import { Children, ReactNode, isValidElement } from 'react';

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
                className={[
                    'grid max-w-full grid-cols-2 gap-4 overflow-x-hidden sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                {Children.map(children, (child, index) => {
                    if (!isValidElement(child)) {
                        return child;
                    }

                    return (
                        <div
                            key={child.key ?? index}
                            className="rounded-hub border border-hub-border-card bg-hub-section p-4"
                        >
                            {child}
                        </div>
                    );
                })}
            </div>
        ),
    },
);
