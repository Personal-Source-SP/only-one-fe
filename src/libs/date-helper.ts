import { DATE_FORMAT_SHORT, DATE_FORMAT_TIME } from '@/constants';
import dayjs from 'dayjs';

export const formatDate = (
    date: string | Date | undefined,
    type: 'short' | 'full' = 'full',
): string => {
    if (!date) return '---';

    switch (type) {
        case 'short':
            return dayjs(date).format(DATE_FORMAT_SHORT);
        case 'full':
            return dayjs(date).format(DATE_FORMAT_TIME);
        default:
            return '---';
    }
};

export const calculateDuration = (startDate: Date | undefined, endDate: Date | undefined) => {
    if (!startDate || !endDate) return '---';
    return dayjs(endDate).diff(startDate, 'second').toString().concat(' giây');
};

export const formatTimeVideoPlayer = (time: number): string => {
    if (isNaN(time)) return '0:00';

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};
