import type { ReactNode } from 'react';

export type EnumOption<TValue extends string | number, TLabel = ReactNode> = {
    value: TValue;
    label: TLabel;
};

export type EnumLike<TValue extends string | number> = Record<string, TValue>;

export type EnumOptionTranslation<TValue extends string | number, TLabel = ReactNode> = (
    value: TValue,
) => TLabel;

export const toEnumOptions = <TValue extends string | number, TLabel = ReactNode>(
    enumLike: EnumLike<TValue>,
    translate?: EnumOptionTranslation<TValue, TLabel>,
): EnumOption<TValue, TLabel>[] => {
    return Object.values(enumLike).map((value) => ({
        value,
        label: translate ? translate(value) : (String(value) as unknown as TLabel),
    }));
};
