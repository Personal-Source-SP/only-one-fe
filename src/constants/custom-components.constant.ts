import { CustomCardPadding, CustomLinkVariant } from '@/interfaces';

// --- CustomCard ---
export const CUSTOM_CARD_PADDING_CLASS_MAP: Record<CustomCardPadding, string> = {
    none: '[&_.ant-card-body]:p-0',
    sm: '[&_.ant-card-body]:p-4',
    default: '[&_.ant-card-body]:p-6',
    lg: '[&_.ant-card-body]:p-8',
    responsive: '[&_.ant-card-body]:p-6 sm:[&_.ant-card-body]:p-8 lg:[&_.ant-card-body]:p-10',
};

export const CUSTOM_CARD_BASE_CLASS_NAME = 'w-full rounded-xl border border-[#F0F0F0] shadow-sm';

export const CUSTOM_CARD_DEFAULT_HEADER_CLASS_NAME = 'mb-6 sm:mb-8';

export const CUSTOM_CARD_DEFAULT_FOOTER_CLASS_NAME =
    'mt-6 text-center text-sm text-slate-600 sm:mt-8';

// --- CustomDivider ---
export const CUSTOM_DIVIDER_CLASS_NAME =
    '!my-0 !border-slate-200 [&_.ant-divider-inner-text]:text-sm [&_.ant-divider-inner-text]:text-slate-500';

// --- CustomLink ---
export const CUSTOM_LINK_VARIANT_CLASS_MAP: Record<CustomLinkVariant, string> = {
    default: 'cursor-pointer text-slate-600 transition-colors duration-200 hover:opacity-80',
    primary: 'cursor-pointer text-[#1840DC] transition-colors duration-200 hover:opacity-80',
};
