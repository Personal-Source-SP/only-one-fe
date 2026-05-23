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
        label: 'Sunset Sand (mặc định)',
        description: 'Canvas cát ấm — card kem nổi, header bảng tách lớp',
        preview: {
            bg: '#ddd4cb',
            muted: '#ebe4dc',
            section: '#faf7f4',
            surface: '#ffffff',
        },
    },
    {
        id: HubThemePalette.SLATE_CANVAS,
        label: 'Cool Slate',
        description: 'Canvas xám xanh trẻ — card sáng kiểu SaaS hiện đại',
        preview: {
            bg: '#dfe3eb',
            muted: '#e9edf3',
            section: '#f8fafc',
            surface: '#ffffff',
        },
    },
    {
        id: HubThemePalette.COOL_MIST,
        label: 'Ocean Breeze',
        description: 'Canvas sky — card trắng pha xanh, fresh & youthful',
        preview: {
            bg: '#d4e5f4',
            muted: '#e3f0fb',
            section: '#f0f9ff',
            surface: '#ffffff',
        },
    },
    {
        id: HubThemePalette.ORANGE_CANVAS,
        label: 'Peach Pulse',
        description: 'Canvas đào — hợp brand cam, card sáng nổi bật',
        preview: {
            bg: '#edd9c8',
            muted: '#f5e8dc',
            section: '#fffbf7',
            surface: '#ffffff',
        },
    },
    {
        id: HubThemePalette.NEUTRAL_GRAY,
        label: 'Mono Fresh',
        description: 'Canvas zinc — tối giản, tương phản rõ shell trắng',
        preview: {
            bg: '#e2e5ea',
            muted: '#eceef2',
            section: '#f9fafb',
            surface: '#ffffff',
        },
    },
] as const;
