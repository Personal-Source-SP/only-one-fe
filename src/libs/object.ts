import { Option } from '@/interfaces';

export const enumToOptions = (enumObj: object): Option[] => {
    return Object.entries(enumObj)
        .filter(([key, value]) => typeof value !== 'number' || isNaN(Number(key)))
        .map(([key, value]) => ({
            value,
            label: key,
        }));
};

export const getEnumKeyByValue = <T extends { [key: string]: string | number }>(
    enumObj: T,
    value: string | number,
): keyof T | undefined => {
    return (Object.keys(enumObj) as Array<keyof T>).find((key) => enumObj[key] === value);
};
