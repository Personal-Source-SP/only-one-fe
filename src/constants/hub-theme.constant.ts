export enum HubThemePalette {
    SLATE_CANVAS = 'slate-canvas',
    WARM_STONE = 'warm-stone',
    COOL_MIST = 'cool-mist',
    ORANGE_CANVAS = 'orange-canvas',
    NEUTRAL_GRAY = 'neutral-gray',
}

export const HUB_THEME_STORAGE_KEY = 'hub_theme_palette';

export const HUB_THEME_PALETTE_IDS = Object.values(HubThemePalette);

/** Palette mặc định khi chưa chọn hoặc giá trị localStorage không hợp lệ. */
export const HUB_THEME_PALETTE: HubThemePalette = HubThemePalette.WARM_STONE;

export const isHubThemePalette = (value: unknown): value is HubThemePalette =>
    typeof value === 'string' && (HUB_THEME_PALETTE_IDS as string[]).includes(value);

export const resolveHubThemePalette = (value: unknown): HubThemePalette =>
    isHubThemePalette(value) ? value : HUB_THEME_PALETTE;

export const HUB_THEME_PALETTE_OPTIONS = [
    {
        id: HubThemePalette.WARM_STONE,
        label: 'Warm Stone (mặc định)',
        description: 'Nền ấm nhẹ, section kem — hợp brand cam',
        preview: { bg: '#f0ebe5', section: '#fffdfb', surface: '#ffffff' },
    },
    {
        id: HubThemePalette.SLATE_CANVAS,
        label: 'Slate Canvas',
        description: 'Nền xám xanh lạnh, section trắng — dashboard chuẩn',
        preview: { bg: '#eef2f6', section: '#ffffff', surface: '#ffffff' },
    },
    {
        id: HubThemePalette.COOL_MIST,
        label: 'Cool Mist',
        description: 'Nền xanh nhạt, section trắng pha lạnh',
        preview: { bg: '#e8eef4', section: '#f8fafc', surface: '#ffffff' },
    },
    {
        id: HubThemePalette.ORANGE_CANVAS,
        label: 'Orange Canvas',
        description: 'Nền cam rất nhạt, section kem cam',
        preview: { bg: '#f5ede6', section: '#fffaf7', surface: '#ffffff' },
    },
    {
        id: HubThemePalette.NEUTRAL_GRAY,
        label: 'Neutral Gray',
        description: 'Nền xám trung tính, section off-white',
        preview: { bg: '#eceef1', section: '#fafafa', surface: '#ffffff' },
    },
] as const;
