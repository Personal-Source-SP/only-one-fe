import { DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type { FormEvaluationContext, FormSectionSchema, ITargetConfig } from '../types';
import { DEFAULT_FEATURE_TEMPLATES, SCRAPER_SERVICE_OPTIONS } from './common.constants';
import { getDefaultFormValuesFromSections } from '../utils';

export const SCRAPING_FORM_SECTIONS: FormSectionSchema[] = [
    {
        id: 'basic',
        title: 'Cấu hình chung',
        description: 'Lựa chọn công cụ trích xuất (Service Engine) phù hợp cho tính năng',
        icon: 'lucide:settings-2',
        fields: [
            {
                name: 'service',
                label: 'Service Engine',
                type: 'select',
                defaultValue: ScraperServiceEnum.GENERIC,
                gridSpan: 24,
                getRules: () => [{ required: true, message: 'Vui lòng chọn engine' }],
                fieldProps: ({ isServiceDisabled }) => ({
                    options: SCRAPER_SERVICE_OPTIONS,
                    disabled: isServiceDisabled,
                }),
            },
        ],
    },
    {
        id: 'selectors_params',
        title: 'Bộ chọn (Selectors) & Tham số truy vấn',
        description: 'Thiết lập các bộ chọn DOM CSS hoặc tham số gọi API',
        icon: 'lucide:sliders',
        visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
        fields: [
            {
                name: 'mainContentSelector',
                label: 'Selector nội dung chính',
                type: 'text',
                defaultValue: '',
                placeholder: 'Ví dụ: #product-detail, .item-list',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'waitForSelector',
                label: 'Selector chờ (Wait for selector)',
                type: 'text',
                defaultValue: '',
                placeholder: 'Ví dụ: .price-tag, #loaded',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'userAgent',
                label: 'User Agent tùy chỉnh',
                type: 'text',
                defaultValue: '',
                placeholder: 'Mozilla/5.0...',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'queryParams',
                label: 'API Query Params',
                type: 'text',
                defaultValue: '',
                placeholder: 'Ví dụ: page={page}&limit={limit}',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.API],
            },
            {
                name: 'firstQueryParams',
                label: 'First Query Params (trang đầu)',
                type: 'text',
                defaultValue: '',
                placeholder: 'Ví dụ: limit={limit}',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.API],
            },
        ],
    },
    {
        id: 'limits',
        title: 'Giới hạn & Thời gian chờ',
        description: 'Kiểm soát số lượng kết quả, số lần thử lại và thời gian timeout',
        icon: 'lucide:repeat',
        fields: [
            {
                name: 'maxResults',
                label: 'Số kết quả tối đa',
                type: 'number',
                defaultValue: 10,
                placeholder: '10',
                gridSpan: ({ service }) =>
                    service !== ScraperServiceEnum.LOCAL ? { xs: 24, sm: 8 } : 24,
                fieldProps: { min: 1, className: 'w-full' },
            },
            {
                name: 'retryDelay',
                label: 'Delay retry (ms)',
                type: 'number',
                defaultValue: 1000,
                placeholder: '1000',
                gridSpan: { xs: 24, sm: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { min: 0, className: 'w-full' },
            },
            {
                name: 'retryAttempts',
                label: 'Số lần thử lại',
                type: 'number',
                defaultValue: 3,
                placeholder: '3',
                gridSpan: { xs: 24, sm: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { min: 0, className: 'w-full' },
            },
            {
                name: 'timeout',
                label: 'Thời gian chờ Request (ms)',
                type: 'number',
                defaultValue: 30000,
                placeholder: '30000',
                gridSpan: { xs: 24, sm: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { min: 1000, className: 'w-full' },
            },
            {
                name: 'waitForTimeout',
                label: 'Thời gian chờ Selector (ms)',
                type: 'number',
                defaultValue: 5000,
                placeholder: '5000',
                gridSpan: { xs: 24, sm: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { min: 0, className: 'w-full' },
            },
        ],
    },
    {
        id: 'advanced_network',
        title: 'Mạng & Trình duyệt Nâng cao',
        description: 'Tùy chọn mô phỏng trình duyệt, vượt bảo vệ chống bot và Headers/Cookies',
        icon: 'lucide:shield-check',
        visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
        fields: [
            {
                name: 'isGetParentElement',
                label: 'Lấy phần tử cha',
                description: 'Trích xuất toàn bộ container bao ngoài của selector',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'stealthMode',
                label: 'Stealth Mode',
                description: 'Ẩn dấu vết tự động hóa để tránh bị trang web chặn',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'cloudflareBypass',
                label: 'Vượt Cloudflare',
                description: 'Tự động giải thử thách Turnstile / Cloudflare challenge',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'javascriptEnabled',
                label: 'Bật JavaScript',
                description: 'Thực thi JavaScript để render nội dung web động',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'imagesEnabled',
                label: 'Tải hình ảnh',
                description: 'Tải tài nguyên hình ảnh (tắt để tăng tốc crawl)',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'cssEnabled',
                label: 'Tải CSS',
                description: 'Tải định dạng CSS styles (tắt để tiết kiệm băng thông)',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'headers',
                label: 'Tùy chỉnh Headers (JSON)',
                description: 'Định cấu hình custom headers gửi kèm request HTTP',
                type: 'json_toggle',
                defaultValue: undefined,
                gridSpan: 24,
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { icon: 'lucide:code-2', defaultEmptyValue: '{\n  \n}' },
            },
            {
                name: 'cookies',
                label: 'Tùy chỉnh Cookies (JSON Array)',
                description: 'Đính kèm danh sách cookies cho session trình duyệt',
                type: 'json_toggle',
                defaultValue: undefined,
                gridSpan: 24,
                visibleWhen: [ScraperServiceEnum.GENERIC],
                fieldProps: { icon: 'lucide:cookie', defaultEmptyValue: '[\n  \n]' },
            },
        ],
    },
    {
        id: 'code_generator',
        title: ({ service }: FormEvaluationContext) => {
            switch (service) {
                case ScraperServiceEnum.API:
                    return 'Mã nguồn Hàm API Response Parser (functionGenerator)';
                case ScraperServiceEnum.LOCAL:
                    return 'Mã nguồn Hàm Local File Parser (functionGenerator)';
                default:
                    return 'Mã nguồn Hàm HTML Parser (functionGenerator)';
            }
        },
        description: 'Hàm JavaScript xử lý dữ liệu trích xuất từ trang web hoặc phản hồi API',
        icon: 'lucide:code-2',
        fields: [
            {
                name: 'functionGenerator',
                label: ({ service }: FormEvaluationContext) => {
                    switch (service) {
                        case ScraperServiceEnum.API:
                            return 'Mã nguồn Hàm API Response Parser (functionGenerator)';
                        case ScraperServiceEnum.LOCAL:
                            return 'Mã nguồn Hàm Local File Parser (functionGenerator)';
                        default:
                            return 'Mã nguồn Hàm HTML Parser (functionGenerator)';
                    }
                },
                type: 'code_editor',
                defaultValue: ({ service }: FormEvaluationContext) =>
                    DEFAULT_FEATURE_TEMPLATES[DataProviderFeatureType.SCRAPING][service],
                gridSpan: 24,
                getRules: () => [{ required: true, message: 'Vui lòng nhập nội dung hàm parser' }],
                fieldProps: { language: 'javascript' },
            },
        ],
    },
];

export const DEFAULT_TARGET_CONFIG: ITargetConfig = getDefaultFormValuesFromSections(
    SCRAPING_FORM_SECTIONS,
    {
        service: ScraperServiceEnum.GENERIC,
        featureType: DataProviderFeatureType.SCRAPING,
    },
) as ITargetConfig;
