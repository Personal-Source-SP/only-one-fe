import { Option } from '@/interfaces';

export const enumToOptions = (enumObj: object): Option[] => {
    return Object.entries(enumObj)
        .filter(([key, value]) => typeof value !== 'number' || isNaN(Number(key)))
        .map(([key, value]) => ({
            value,
            label: key,
        }));
};
