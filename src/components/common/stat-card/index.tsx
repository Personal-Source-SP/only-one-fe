'use client';

import { StatCardTrend } from '@/enums';
import { ReactNode, useMemo } from 'react';

type StatCardProps = {
    title: string;
    value: string;
    color: string;
    change: string;
    icon: ReactNode;
    trend: StatCardTrend;
};

export const StatCard = ({ title, value, color, change, icon, trend }: StatCardProps) => {
    const colorClass = color.replace('bg-', '');

    const trendClass = useMemo(() => {
        switch (trend) {
            case StatCardTrend.UP:
                return 'text-emerald-700 bg-emerald-50';
            case StatCardTrend.DOWN:
                return 'text-rose-700 bg-rose-50';
            default:
                return 'text-slate-600 bg-slate-100';
        }
    }, [trend]);

    return (
        <div className="hub-section-panel group relative flex h-full flex-col justify-between overflow-hidden rounded-hub-card p-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-hub-section-muted sm:p-5">
            <div
                className={`absolute top-0 left-0 w-full h-1 bg-${colorClass} opacity-0 group-hover:opacity-100 transition-opacity`}
            />

            <div className="flex justify-between items-start relative z-10 mb-2 sm:mb-0">
                <div className="flex-1 min-w-0 mr-2">
                    <p
                        className="text-xs sm:text-sm font-medium text-slate-500 mb-0.5 sm:mb-1 group-hover:text-slate-600 transition-colors truncate"
                        title={title}
                    >
                        {title}
                    </p>
                    <h3 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight truncate">
                        {value}
                    </h3>
                </div>
                <div
                    className={`p-2 sm:p-2.5 rounded-lg ${color} bg-opacity-90 group-hover:bg-opacity-100 shadow-sm group-hover:scale-110 transition-all duration-300 flex-shrink-0`}
                >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 text-white flex items-center justify-center">
                        {icon}
                    </div>
                </div>
            </div>

            {change && (
                <div className="mt-1 sm:mt-3 flex items-center text-xs">
                    <div
                        className={`flex items-center font-medium px-1.5 py-0.5 rounded ${
                            trendClass
                        }`}
                    >
                        <span>{trend === 'up' ? '↗' : trend === 'down' ? '↘' : '•'}</span>
                        <span className="ml-1">{change}</span>
                    </div>
                    <span className="text-slate-400 ml-2 hidden sm:inline-block truncate">
                        vs tháng trước
                    </span>
                </div>
            )}
        </div>
    );
};
