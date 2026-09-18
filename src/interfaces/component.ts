import type { ReactNode } from 'react';

export interface IOption<TValue = string | number, TLabel = ReactNode> {
    value: TValue;
    label: TLabel;
    key?: string;
}

export type CustomCardPadding = 'sm' | 'lg' | 'none' | 'default' | 'responsive';

export type CustomCardShadow = 'none' | 'sm';

export type CustomLinkVariant = 'default' | 'primary';

export type CustomButtonHubVariant = 'cta';

export type CustomTagStatus = 'active' | 'running' | 'draft' | 'error' | 'warning';

export type CustomAlertType = 'info' | 'success' | 'warning' | 'error';
