import { CustomCardPadding, CustomLinkVariant } from '@/interfaces';

// --- Style A design tokens (Minimal & Swiss) ---
export const HUB_COLOR_PRIMARY = '#2563EB';
export const HUB_COLOR_CTA = '#F97316';
export const HUB_COLOR_BG = '#F8FAFC';
export const HUB_COLOR_SURFACE = '#FFFFFF';
export const HUB_COLOR_BORDER = '#E2E8F0';
export const HUB_COLOR_BORDER_CARD = '#F0F0F0';
export const HUB_COLOR_TEXT = '#1E293B';
export const HUB_COLOR_TITLE = '#111527';
export const HUB_COLOR_MUTED = '#64748B';
export const HUB_COLOR_SUCCESS = '#16A34A';
export const HUB_RADIUS = 8;
export const HUB_RADIUS_CARD = 12;
export const HUB_MODAL_WIDTH = 1200;
export const HUB_TOUCH_MIN_HEIGHT = 44;

// --- CustomCard ---
export const CUSTOM_CARD_PADDING_CLASS_MAP: Record<CustomCardPadding, string> = {
    none: '[&_.ant-card-body]:p-0',
    sm: '[&_.ant-card-body]:p-4',
    default: '[&_.ant-card-body]:p-6',
    lg: '[&_.ant-card-body]:p-8',
    responsive: '[&_.ant-card-body]:p-4 sm:[&_.ant-card-body]:p-6 lg:[&_.ant-card-body]:p-8',
};

export const CUSTOM_CARD_BASE_CLASS_NAME =
    'w-full rounded-xl border border-hub-border-card bg-hub-surface shadow-sm';

export const CUSTOM_CARD_TITLE_CLASS_NAME = 'text-lg font-medium text-hub-title';

export const CUSTOM_CARD_DESCRIPTION_CLASS_NAME = 'text-sm text-hub-muted';

export const CUSTOM_CARD_DEFAULT_HEADER_CLASS_NAME = 'mb-6 sm:mb-8';

export const CUSTOM_CARD_DEFAULT_FOOTER_CLASS_NAME =
    'mt-6 text-center text-sm text-hub-muted sm:mt-8';

// --- CustomDivider ---
export const CUSTOM_DIVIDER_CLASS_NAME =
    '!my-0 !border-hub-border [&_.ant-divider-inner-text]:text-sm [&_.ant-divider-inner-text]:text-hub-muted';

// --- CustomLink ---
export const CUSTOM_LINK_VARIANT_CLASS_MAP: Record<CustomLinkVariant, string> = {
    default: 'cursor-pointer text-hub-muted transition-colors duration-200 hover:text-hub-text',
    primary: 'cursor-pointer text-hub-primary transition-colors duration-200 hover:opacity-80',
};

// --- CustomButton ---
export const CUSTOM_BUTTON_CTA_CLASS_NAME =
    '!border-hub-cta !bg-hub-cta !text-white hover:!opacity-90 focus-visible:!outline-hub-cta';

export const CUSTOM_BUTTON_TOUCH_CLASS_NAME = 'min-h-11 sm:min-h-9';

// --- CustomInput ---
export const CUSTOM_INPUT_CLASS_NAME =
    'min-h-11 sm:min-h-10 [&_.ant-input]:min-h-11 sm:[&_.ant-input]:min-h-10';

// --- CustomFilter ---
export const CUSTOM_FILTER_PANEL_CLASS_NAME =
    'w-full rounded-xl border border-hub-border-card bg-hub-surface p-4';

export const CUSTOM_FILTER_LABEL_CLASS_NAME = 'mb-1 block text-sm font-semibold text-hub-muted';

export const CUSTOM_FILTER_BADGE_CLASS_NAME =
    'ml-1 min-w-5 rounded-full bg-hub-primary px-1.5 py-0.5 text-center text-[10px] text-white';

// --- CustomModal ---
export const CUSTOM_MODAL_BODY_CLASS_NAME = '!max-h-[calc(100vh-200px)] !overflow-y-auto';

export const CUSTOM_MODAL_MOBILE_WRAP_CLASS_NAME = '[&_.ant-modal]:!max-w-[calc(100vw-32px)]';

// --- CustomAlert ---
export const CUSTOM_ALERT_INFO_CLASS_NAME =
    '!border-blue-200 !bg-blue-50 [&_.ant-alert-message]:!text-blue-800';

export const CUSTOM_ALERT_SUCCESS_CLASS_NAME =
    '!border-green-200 !bg-green-50 [&_.ant-alert-message]:!text-green-800';

// --- CustomTag status presets ---
export const CUSTOM_TAG_STATUS_CLASS_MAP = {
    active: 'border-green-200 bg-green-100 text-green-800',
    running: 'border-blue-200 bg-blue-100 text-blue-800',
    draft: 'border-slate-200 bg-slate-100 text-slate-600',
} as const;

// --- CustomElement / TableContainer shell ---
export const CUSTOM_ELEMENT_CONTAINER_CLASS_NAME =
    'w-full bg-hub-surface p-3 md:rounded-xl md:border md:border-hub-border-card';

export const CUSTOM_ELEMENT_CARD_CLASS_NAME =
    'w-full bg-hub-surface md:rounded-xl md:border md:border-hub-border-card';

// --- Sidebar nav (Style A active state) ---
export const SIDEBAR_NAV_ACTIVE_CLASS_NAME = 'bg-blue-50/80 text-hub-primary shadow-sm';

export const SIDEBAR_NAV_ACTIVE_INDICATOR_CLASS_NAME =
    'absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-hub-primary';

export const SIDEBAR_NAV_ICON_ACTIVE_CLASS_NAME = 'text-hub-primary';

export const SIDEBAR_NAV_SUB_ACTIVE_CLASS_NAME = 'bg-blue-50 font-medium text-hub-primary';
