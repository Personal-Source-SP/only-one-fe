import { DATE_FORMAT_TIME } from '@/config/date';
import { formatJsonString, safeParseJson } from '@/utilities';
import dayjs from 'dayjs';
import { isBoolean, isEqual, isNil } from 'lodash';
import { ScraperServiceEnum } from '../enums';
import type { ScrapingConfigFormValues } from '../types';

export interface IFeatureFieldMetadata {
    label: string;
    section: string;
    isCode?: boolean;
    codeLanguage?: 'javascript' | 'json';
}

export interface IFeatureDiffItem extends IFeatureFieldMetadata {
    key: string;
    oldValue: unknown;
    newValue: unknown;
    displayOldValue: string;
    displayNewValue: string;
}

const FIELD_METADATA: Record<string, IFeatureFieldMetadata> = {
    service: { label: 'Dịch vụ cào (Service)', section: 'Cấu hình cơ bản' },
    functionGenerator: {
        label: 'Hàm Parser (Function Generator)',
        section: 'Mã nguồn Script',
        isCode: true,
        codeLanguage: 'javascript',
    },
    mainContentSelector: { label: 'Selector nội dung chính', section: 'Bộ chọn DOM' },
    waitForSelector: { label: 'Selector chờ xuất hiện', section: 'Bộ chọn DOM' },
    userAgent: { label: 'User Agent', section: 'Nâng cao / Mạng' },
    maxResults: { label: 'Số lượng kết quả tối đa', section: 'Giới hạn & Thử lại' },
    retryAttempts: { label: 'Số lần thử lại', section: 'Giới hạn & Thử lại' },
    retryDelay: { label: 'Thời gian chờ thử lại (ms)', section: 'Giới hạn & Thử lại' },
    timeout: { label: 'Thời gian chờ tối đa (ms)', section: 'Giới hạn & Thử lại' },
    waitForTimeout: {
        label: 'Thời gian delay sau khi load (ms)',
        section: 'Giới hạn & Thử lại',
    },
    queryParams: { label: 'Tham số URL Query', section: 'Nâng cao / Mạng' },
    firstQueryParams: { label: 'Tham số URL Query trang đầu', section: 'Nâng cao / Mạng' },
    headers: { label: 'HTTP Headers', section: 'Nâng cao / Mạng' },
    cookies: { label: 'Cookies', section: 'Nâng cao / Mạng' },
    isGetParentElement: { label: 'Lấy phần tử cha', section: 'Bộ chọn DOM' },
    stealthMode: { label: 'Chế độ ẩn danh (Stealth)', section: 'Nâng cao / Trình duyệt' },
    cloudflareBypass: { label: 'Vượt Cloudflare', section: 'Nâng cao / Trình duyệt' },
    javascriptEnabled: { label: 'Bật JavaScript', section: 'Nâng cao / Trình duyệt' },
    imagesEnabled: { label: 'Tải hình ảnh', section: 'Nâng cao / Trình duyệt' },
    cssEnabled: { label: 'Tải CSS', section: 'Nâng cao / Trình duyệt' },
    searchUrlPattern: {
        label: 'Định dạng URL tìm kiếm',
        section: 'URL & Bộ chọn Tìm kiếm',
    },
    queryPlaceholder: {
        label: 'Placeholder từ khóa',
        section: 'URL & Bộ chọn Tìm kiếm',
    },
    resultSelector: { label: 'Selector kết quả', section: 'URL & Bộ chọn Tìm kiếm' },
};

export const formatDiffValue = (val: unknown, key: string): string => {
    if (isNil(val) || val === '') return '(Trống)';
    if (isBoolean(val)) return val ? 'Bật (True)' : 'Tắt (False)';

    if (['headers', 'cookies'].includes(key)) {
        const parsed = typeof val === 'string' ? safeParseJson(val) : val;
        return formatJsonString(parsed) || '(Trống)';
    }

    return String(val);
};

export const calculateFeatureConfigDiff = (
    originalConfig: Record<string, unknown> = {},
    originalService: ScraperServiceEnum = ScraperServiceEnum.GENERIC,
    formValues: Partial<ScrapingConfigFormValues> = {},
): IFeatureDiffItem[] => {
    const diffs: IFeatureDiffItem[] = [];

    // 1. So sánh Service
    const currentService = formValues.service || ScraperServiceEnum.GENERIC;
    if (!isEqual(currentService, originalService)) {
        diffs.push({
            ...FIELD_METADATA.service,
            key: 'service',
            newValue: currentService,
            oldValue: originalService,
            displayOldValue: originalService,
            displayNewValue: currentService,
        });
    }

    // 2. So sánh các trường form theo metadata
    Object.entries(FIELD_METADATA).forEach(([key, metadata]) => {
        if (key === 'service') return;

        const newVal = (formValues as Record<string, any>)[key];
        const oldVal = (originalConfig as Record<string, any>)[key];

        // Trường JSON Object/Array (headers, cookies)
        if (key === 'headers' || key === 'cookies') {
            const parsedOld = typeof oldVal === 'string' ? safeParseJson(oldVal) : oldVal;
            const parsedNew = typeof newVal === 'string' ? safeParseJson(newVal) : newVal;

            if (!isEqual(parsedOld, parsedNew)) {
                const normOld = formatJsonString(parsedOld);
                const normNew = formatJsonString(parsedNew);

                diffs.push({
                    ...metadata,
                    key,
                    oldValue: normOld,
                    newValue: normNew,
                    displayOldValue: formatDiffValue(normOld, key),
                    displayNewValue: formatDiffValue(normNew, key),
                });
            }
            return;
        }

        // Trường Primitive (string, number, boolean)
        const sanitizedOld = oldVal ?? (isBoolean(newVal) ? false : undefined);
        const sanitizedNew = newVal ?? (isBoolean(oldVal) ? false : undefined);

        if (!isEqual(sanitizedOld, sanitizedNew)) {
            diffs.push({
                ...metadata,
                key,
                oldValue: sanitizedOld,
                newValue: sanitizedNew,
                displayOldValue: formatDiffValue(sanitizedOld, key),
                displayNewValue: formatDiffValue(sanitizedNew, key),
            });
        }
    });

    return diffs;
};

export const generateAutoChangeDescription = (
    diffs: IFeatureDiffItem[],
    timestamp: string | Date = new Date(),
): string => {
    const formattedTime = dayjs(timestamp).format(DATE_FORMAT_TIME);
    if (!diffs?.length) return `Cập nhật cấu hình lúc ${formattedTime}`;

    const fieldLabels = diffs.map((d) => d.label).join(', ');
    return `Cập nhật cấu hình: [${fieldLabels}] lúc ${formattedTime}`;
};
