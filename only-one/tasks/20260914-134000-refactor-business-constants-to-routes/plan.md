---
status: done
slug: 20260914-134000-refactor-business-constants-to-routes
started_at: 2026-09-14
completed_at: 2026-09-14
pr_url: ~
branch: ~
---

# Plan: Di chuyển Business Constants về Route và Tinh gọn, Phân tách Modular Toàn diện

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế hiện tại**: Thư mục global `src/constants/` đang chứa 8 file lớn với nhiều trách nhiệm hỗn tạp (`data-provider.constant.ts` chứa code templates, `common.constant.ts` gom Date, Storage, Pagination, Auth, Assets và Google options). Đồng thời, các route pages (`dashboard`, `google/drive/photos`, `google/keep`, `scraping/data-providers`, `scraping/discovery`, `scraping/scraping-data`) đang dùng các file đơn lẻ `constants.ts` chứa hỗn hợp nhiều nhóm hằng số khác nhau chưa được module hóa.
- **Khớp nối kỹ thuật (Tight Coupling)**: Các module tính năng tại `src/app/(root)/scraping/features/` và `src/libs/googleapis.ts` import trực tiếp từ `@/constants`, vi phạm nguyên tắc Route Colocation và Feature-Sliced Design.
- **Danh sách Invariants bắt buộc giữ nguyên**:
  - Duy trì barrel export tại `src/constants/index.ts` và tại từng thư mục `constants/index.ts` của các route page để đảm bảo 100% tương thích ngược với mọi câu lệnh `import { ... } from '@/constants'` và `import { ... } from './constants'`.
  - Mỗi file constant nhỏ phải là file lá (leaf file) độc lập hoàn toàn, không import chéo từ các file cùng cấp hoặc từ hooks/utils để triệt tiêu nguy cơ circular dependency.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế tại concept.md; không phát sinh Type Contract mới)*

- **Phân rã file và AST Seams**:
  1. **Global Constants (`src/constants/`)**:
     - `storage.constant.ts` [NEW]: `KEY_LOCAL_STORAGE`, `KEY_SESSION_STORAGE`.
     - `pagination.constant.ts` [NEW]: `DEFAULT_PAGE_INDEX`, `DEFAULT_PAGE_SIZE`, `DEFAULT_SORTERS`.
     - `date.constant.ts` [NEW]: `DATE_FORMAT_SHORT`, `DATE_FORMAT_TIME`.
     - `system.constant.ts` [NEW]: `SERVER_IS_NOT_READY_MESSAGE`, `DEFAULT_FILE_IMAGE_URL`.
     - `auth.constant.ts` [NEW]: `AUTH_PUBLIC_PAGES`, `AUTH_SIGN_IN_*`, `AUTH_REGISTER_*`, `mapNextAuthSignInErrorMessage`.
     - `common.constant.ts`, `auth-errors.constant.ts`, `data-provider.constant.ts` [DELETE].
     - `index.ts` [MODIFY]: Re-export toàn bộ modular constants.
  2. **Scraping Features (`src/app/(root)/scraping/features/constants/`)**:
     - `feature-templates.constants.ts` [NEW]: Code generator template strings (`DEFAULT_PARSER_FUNCTION_GENERATOR`, `DEFAULT_SEARCH_FUNCTION_GENERATOR`, `DEFAULT_SEARCH_API_FUNCTION_GENERATOR`, `DEFAULT_HTML_CONTENT_STRING`, `DEFAULT_API_FUNCTION_GENERATOR`).
     - `common.constants.ts`, `index.ts` [MODIFY].
     - `feature-config-transform.ts`, `TestInputSection.tsx` [MODIFY]: Cập nhật import sang `../constants`.
  3. **Route Pages Modularization**:
     - `src/app/(root)/dashboard/constants/`: `recent-data.constants.ts`, `metrics-data.constants.ts`, `index.ts`.
     - `src/app/(root)/google/drive/photos/constants/`: `view.constants.ts`, `slideshow.constants.ts`, `filter.constants.ts`, `index.ts`.
     - `src/app/(root)/google/keep/constants/`: `keep-options.constants.ts`, `keep-initial-data.constants.ts`, `index.ts`.
     - `src/app/(root)/scraping/data-providers/constants/`: `data-provider-form.constants.ts`, `data-provider-table.constants.ts`, `index.ts`.
     - `src/app/(root)/scraping/discovery/constants/`: `discovery-status.constants.ts`, `discovery-form.constants.ts`, `index.ts`.
     - `src/app/(root)/scraping/scraping-data/constants/`: `filter.constants.ts`, `index.ts`.
  4. **Google Libs**:
     - `src/libs/googleapis.ts` [MODIFY]: Khai báo trực tiếp `GOOGLE_SCOPES` nội bộ.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── app/(root)/
│   ├── dashboard/
│   │   ├── [DELETE] constants.ts
│   │   └── constants/
│   │       ├── [NEW]    recent-data.constants.ts
│   │       ├── [NEW]    metrics-data.constants.ts
│   │       └── [NEW]    index.ts
│   ├── google/
│   │   ├── drive/photos/
│   │   │   ├── [DELETE] constants.ts
│   │   │   └── constants/
│   │   │       ├── [NEW]    view.constants.ts
│   │   │       ├── [NEW]    slideshow.constants.ts
│   │   │       ├── [NEW]    filter.constants.ts
│   │   │       └── [NEW]    index.ts
│   │   └── keep/
│   │       ├── [DELETE] constants.ts
│   │       └── constants/
│   │           ├── [NEW]    keep-options.constants.ts
│   │           ├── [NEW]    keep-initial-data.constants.ts
│   │           └── [NEW]    index.ts
│   └── scraping/
│       ├── data-providers/
│       │   ├── [DELETE] constants.ts
│       │   └── constants/
│       │       ├── [NEW]    data-provider-form.constants.ts
│       │       ├── [NEW]    data-provider-table.constants.ts
│       │       └── [NEW]    index.ts
│       ├── discovery/
│       │   ├── [DELETE] constants.ts
│       │   └── constants/
│       │       ├── [NEW]    discovery-status.constants.ts
│       │       ├── [NEW]    discovery-form.constants.ts
│       │       └── [NEW]    index.ts
│       ├── features/
│       │   ├── components/FeatureTestTab/
│       │   │   └── [MODIFY] TestInputSection.tsx
│       │   ├── constants/
│       │   │   ├── [NEW]    feature-templates.constants.ts
│       │   │   ├── [MODIFY] common.constants.ts
│       │   │   └── [MODIFY] index.ts
│       │   └── utils/
│       │       └── [MODIFY] feature-config-transform.ts
│       └── scraping-data/
│           ├── [DELETE] constants.ts
│           └── constants/
│               ├── [NEW]    filter.constants.ts
│               └── [NEW]    index.ts
├── constants/
│   ├── [NEW]    auth.constant.ts
│   ├── [DELETE] auth-errors.constant.ts
│   ├── [DELETE] common.constant.ts
│   ├── [DELETE] data-provider.constant.ts
│   ├── [NEW]    date.constant.ts
│   ├── [NEW]    pagination.constant.ts
│   ├── [NEW]    storage.constant.ts
│   ├── [NEW]    system.constant.ts
│   ├── [MODIFY] font.constant.ts
│   ├── [MODIFY] hub-theme.constant.ts
│   ├── [MODIFY] sidebar.constant.ts
│   ├── [MODIFY] socket.constant.ts
│   └── [MODIFY] index.ts
└── libs/
    └── [MODIFY] googleapis.ts
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/constants/storage.constant.ts` | `KEY_LOCAL_STORAGE`, `KEY_SESSION_STORAGE` | `None` | `npm run build` |
| **2** | `[x]` | `[NEW]` | `src/constants/pagination.constant.ts` | `DEFAULT_PAGE_INDEX`, `DEFAULT_PAGE_SIZE`, `DEFAULT_SORTERS` | `None` | `npm run build` |
| **3** | `[x]` | `[NEW]` | `src/constants/date.constant.ts` | `DATE_FORMAT_SHORT`, `DATE_FORMAT_TIME` | `None` | `npm run build` |
| **4** | `[x]` | `[NEW]` | `src/constants/system.constant.ts` | `SERVER_IS_NOT_READY_MESSAGE`, `DEFAULT_FILE_IMAGE_URL` | `None` | `npm run build` |
| **5** | `[x]` | `[NEW]` | `src/constants/auth.constant.ts` | `AUTH_PUBLIC_PAGES`, `mapNextAuthSignInErrorMessage`, etc. | `None` | `npm run build` |
| **6** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/constants/feature-templates.constants.ts` | Generator template strings | `None` | `npm run build` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/constants/index.ts` | Export `feature-templates.constants` | `Order 6` | `npm run build` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/constants/common.constants.ts` | Template imports | `Order 6` | `npm run build` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/utils/feature-config-transform.ts` | `DEFAULT_PARSER_FUNCTION_GENERATOR` import | `Order 7` | `npm run build` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureTestTab/TestInputSection.tsx` | `DEFAULT_HTML_CONTENT_STRING` import | `Order 7` | `npm run build` |
| **11** | `[x]` | `[MODIFY]` | `src/libs/googleapis.ts` | `GOOGLE_SCOPES` definition | `None` | `npm run build` |
| **12** | `[x]` | `[NEW]` | `src/app/(root)/dashboard/constants/recent-data.constants.ts` | `recentFiles`, `recentPhotos`, `recentNotes` | `None` | `npm run build` |
| **13** | `[x]` | `[NEW]` | `src/app/(root)/dashboard/constants/metrics-data.constants.ts` | `storageData`, `activityData` | `None` | `npm run build` |
| **14** | `[x]` | `[NEW]` | `src/app/(root)/dashboard/constants/index.ts` | Barrel exports | `Order 12, 13` | `npm run build` |
| **15** | `[x]` | `[DELETE]` | `src/app/(root)/dashboard/constants.ts` | Xóa file đơn cũ | `Order 14` | `npm run build` |
| **16** | `[x]` | `[NEW]` | `src/app/(root)/google/drive/photos/constants/view.constants.ts` | `viewModeOptions`, `qualityModeOptions`, `columnOptions` | `None` | `npm run build` |
| **17** | `[x]` | `[NEW]` | `src/app/(root)/google/drive/photos/constants/slideshow.constants.ts` | `SLIDESHOW_DELAY_OPTIONS`, `SLIDESHOW_DELAY_DEFAULT` | `None` | `npm run build` |
| **18** | `[x]` | `[NEW]` | `src/app/(root)/google/drive/photos/constants/filter.constants.ts` | `filterSearch`, `ITEMS_PER_PAGE_OPTIONS`, `ITEMS_PER_PAGE_DEFAULT` | `None` | `npm run build` |
| **19** | `[x]` | `[NEW]` | `src/app/(root)/google/drive/photos/constants/index.ts` | Barrel exports | `Order 16..18` | `npm run build` |
| **20** | `[x]` | `[DELETE]` | `src/app/(root)/google/drive/photos/constants.ts` | Xóa file đơn cũ | `Order 19` | `npm run build` |
| **21** | `[x]` | `[NEW]` | `src/app/(root)/google/keep/constants/keep-options.constants.ts` | `colorOptions`, `labelOptions`, `sortMenu` | `None` | `npm run build` |
| **22** | `[x]` | `[NEW]` | `src/app/(root)/google/keep/constants/keep-initial-data.constants.ts` | `initialNotes`, `initialNoteLabels` | `None` | `npm run build` |
| **23** | `[x]` | `[NEW]` | `src/app/(root)/google/keep/constants/index.ts` | Barrel exports | `Order 21, 22` | `npm run build` |
| **24** | `[x]` | `[DELETE]` | `src/app/(root)/google/keep/constants.ts` | Xóa file đơn cũ | `Order 23` | `npm run build` |
| **25** | `[x]` | `[NEW]` | `src/app/(root)/scraping/data-providers/constants/data-provider-form.constants.ts` | `DATA_PROVIDER_INITIAL_VALUES`, `DATA_PROVIDER_LIMITS` | `None` | `npm run build` |
| **26** | `[x]` | `[NEW]` | `src/app/(root)/scraping/data-providers/constants/data-provider-table.constants.ts` | `DATA_PROVIDER_COLUMNS_WIDTH` | `None` | `npm run build` |
| **27** | `[x]` | `[NEW]` | `src/app/(root)/scraping/data-providers/constants/index.ts` | Barrel exports | `Order 25, 26` | `npm run build` |
| **28** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/data-providers/constants.ts` | Xóa file đơn cũ | `Order 27` | `npm run build` |
| **29** | `[x]` | `[NEW]` | `src/app/(root)/scraping/discovery/constants/discovery-status.constants.ts` | `DISCOVERY_SESSION_STATUS_COLOR_MAP`, `DISCOVERY_SESSION_STATUS_LABELS` | `None` | `npm run build` |
| **30** | `[x]` | `[NEW]` | `src/app/(root)/scraping/discovery/constants/discovery-form.constants.ts` | `DEFAULT_CREATE_SESSION_VALUES` | `None` | `npm run build` |
| **31** | `[x]` | `[NEW]` | `src/app/(root)/scraping/discovery/constants/index.ts` | Barrel exports | `Order 29, 30` | `npm run build` |
| **32** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/discovery/constants.ts` | Xóa file đơn cũ | `Order 31` | `npm run build` |
| **33** | `[x]` | `[NEW]` | `src/app/(root)/scraping/scraping-data/constants/filter.constants.ts` | `dataTypeOptions`, `viewModeOptions`, `columnDisplayOptions`, `getFilterSearch` | `None` | `npm run build` |
| **34** | `[x]` | `[NEW]` | `src/app/(root)/scraping/scraping-data/constants/index.ts` | Barrel exports | `Order 33` | `npm run build` |
| **35** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/scraping-data/constants.ts` | Xóa file đơn cũ | `Order 34` | `npm run build` |
| **36** | `[x]` | `[DELETE]` | `src/constants/data-provider.constant.ts` | Xóa file data-provider.constant.ts | `Order 6, 8..10` | `npm run build` |
| **37** | `[x]` | `[DELETE]` | `src/constants/auth-errors.constant.ts` | Xóa file auth-errors.constant.ts | `Order 5` | `npm run build` |
| **38** | `[x]` | `[DELETE]` | `src/constants/common.constant.ts` | Xóa file common.constant.ts | `Order 1..5, 11, 16..18` | `npm run build` |
| **39** | `[x]` | `[MODIFY]` | `src/constants/index.ts` | Barrel re-export modular constants | `Order 1..5, 36..38` | `npm run build` |

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/constants/storage.constant.ts`
```typescript
export const KEY_LOCAL_STORAGE = {
    FIREBASE_TOKEN: 'firebase_token',
    GOOGLE_ACCESS_TOKEN: 'google_access_token',
    GOOGLE_TOKEN_EXPIRY: 'google_token_expiry',
    GOOGLE_REFRESH_TOKEN: 'google_refresh_token',
    GOOGLE_CODE_VERIFIER: 'google_code_verifier',
};

export const KEY_SESSION_STORAGE = {
    RETURN_URL: 'returnUrl',
};
```

---

### 2. `[NEW]` `src/constants/pagination.constant.ts`
```typescript
export const DEFAULT_PAGE_INDEX = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SORTERS = [{ field: 'createdAt', order: 'desc' as const }];
```

---

### 3. `[NEW]` `src/constants/date.constant.ts`
```typescript
export const DATE_FORMAT_SHORT = 'DD/MM/YYYY';
export const DATE_FORMAT_TIME = 'DD/MM/YYYY HH:mm:ss';
```

---

### 4. `[NEW]` `src/constants/system.constant.ts`
```typescript
export const SERVER_IS_NOT_READY_MESSAGE = 'Server is not ready';
export const DEFAULT_FILE_IMAGE_URL = '/images/default-file-image.png';
```

---

### 5. `[NEW]` `src/constants/auth.constant.ts`
```typescript
export const AUTH_PUBLIC_PAGES = ['/login', '/register', '/forget-password'];

export const AUTH_SIGN_IN_DEFAULT_FAILURE_MESSAGE =
    'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';

export const AUTH_SIGN_IN_INVALID_CREDENTIALS_MESSAGE = 'Email hoặc mật khẩu không đúng.';

export const AUTH_SIGN_IN_UNKNOWN_FAILURE_MESSAGE =
    'Không thể đăng nhập lúc này. Vui lòng thử lại sau.';

export const AUTH_REGISTER_UNKNOWN_FAILURE_MESSAGE =
    'Đăng ký thất bại. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.';

export const mapNextAuthSignInErrorMessage = (error: string | undefined): string => {
    const trimmed = error?.trim();
    if (!trimmed) {
        return AUTH_SIGN_IN_DEFAULT_FAILURE_MESSAGE;
    }

    const hasExtendedChar = [...trimmed].some((ch) => ch.charCodeAt(0) > 0x7f);
    if (hasExtendedChar) {
        return trimmed;
    }

    const normalized = trimmed.toLowerCase();

    if (
        normalized.includes('credentials') ||
        normalized.includes('invalid') ||
        normalized.includes('unauthorized')
    ) {
        return AUTH_SIGN_IN_INVALID_CREDENTIALS_MESSAGE;
    }

    return AUTH_SIGN_IN_UNKNOWN_FAILURE_MESSAGE;
};
```

---

### 6. `[NEW]` `src/app/(root)/scraping/features/constants/feature-templates.constants.ts`
```typescript
export const DEFAULT_PARSER_FUNCTION_GENERATOR = `
const extractData = (html) => {
  const $ = cheerio.load(html);
  try {
    // Extract data here to match expected output, including productVariants
  } catch (error) {
    console.error('Error scraping the HTML:', error);
    return null;
  }
};
`;

export const DEFAULT_SEARCH_FUNCTION_GENERATOR = `
const searchData = (html) => {
  const $ = cheerio.load(html);
  try {
    const productElements = $('${resultSelector}');
    const results = [];

    productElements.each((_, element) => {
      const $element = $(element);

      const product = {
        url: $element.find('a').attr('href') || '',
        title: $element.find('.product-title').text().trim() || '',
        imageUrl: $element.find('img').attr('src') || '',
        relativeUrl: $element.find('a').attr('href') || '',
        metadata: {}
      };

      results.push(product);
    });

    return results;
  } catch (error) {
    console.error('Error searching the HTML:', error);
    return null;
  }
};
`;

export const DEFAULT_SEARCH_API_FUNCTION_GENERATOR = `
const searchData = async (data, axios) => {
  try {
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : [];

    const results = items.map((item) => ({
      url: item?.url || item?.link || item?.productUrl || '',
      title: item?.title || item?.name || '',
      imageUrl: item?.imageUrl || item?.thumbnail || item?.image || '',
      relativeUrl: item?.relativeUrl || '',
      metadata: item?.metadata || {}
    }));

    return results;
  } catch (error) {
    console.error('Error searching the API data:', error?.message);
    return null;
  }
};
`;

export const DEFAULT_HTML_CONTENT_STRING = `
// Paste the HTML content here
`;

export const DEFAULT_API_FUNCTION_GENERATOR = `
const extractData = async (data, axios) => {
  const reviewItems = data?.map((i) => i.id);

  if (!reviewItems || reviewItems.length === 0) {
    return null;
  }

  try {
    // Extract data here to match expected output, including productVariants
    let responseData = [];

    for (const reviewItem of reviewItems) {
      const review = await axios.get(\`https://api.gai13.net/escort/reviews/\${reviewItem}\`);

      responseData.push(...(review?.data?.data?.review?.photos || []));
    }

    const results = responseData?.map((item) => ({
      url: item?.data?.dimensions?.original?.url,
    }));

    return results || [];
  } catch (error) {
    console.error('Error scraping the data:', error?.message);
    return null;
  }
};
`;
```

---

### 7. `[MODIFY]` `src/app/(root)/scraping/features/constants/index.ts`
```diff
@@ line 1 @@
 export * from './common.constants';
 export * from './feature-form.constants';
+export * from './feature-templates.constants';
 export * from './scraping-config.constants';
 export * from './search-config.constants';
 export * from './feature-status.constants';
```

---

### 8. `[MODIFY]` `src/app/(root)/scraping/features/constants/common.constants.ts`
```diff
@@ line 1 @@
-import {
-    DEFAULT_API_FUNCTION_GENERATOR,
-    DEFAULT_PARSER_FUNCTION_GENERATOR,
-    DEFAULT_SEARCH_API_FUNCTION_GENERATOR,
-    DEFAULT_SEARCH_FUNCTION_GENERATOR,
-} from '@/constants';
 import { DataProviderFeatureType, ScraperServiceEnum } from '../enums';
+import {
+    DEFAULT_API_FUNCTION_GENERATOR,
+    DEFAULT_PARSER_FUNCTION_GENERATOR,
+    DEFAULT_SEARCH_API_FUNCTION_GENERATOR,
+    DEFAULT_SEARCH_FUNCTION_GENERATOR,
+} from './feature-templates.constants';
```

---

### 9. `[MODIFY]` `src/app/(root)/scraping/features/utils/feature-config-transform.ts`
```diff
@@ line 1 @@
 import { isPlainObject } from 'lodash';
-import { DEFAULT_PARSER_FUNCTION_GENERATOR } from '@/constants';
+import { DEFAULT_PARSER_FUNCTION_GENERATOR } from '../constants';
 import { DataProviderFeatureType, ScraperServiceEnum } from '../enums';
```

---

### 10. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureTestTab/TestInputSection.tsx`
```diff
@@ line 10 @@
 import {
     CustomButton,
     CustomCard,
     CustomCol,
     CustomFlex,
     CustomForm,
     CustomInput,
     CustomRow,
     CustomSegmented,
     CustomSpace,
     CustomTypography,
 } from '@/components/custom-antd';
-import { DEFAULT_HTML_CONTENT_STRING } from '@/constants';
+import { DEFAULT_HTML_CONTENT_STRING } from '../../constants';
```

---

### 11. `[MODIFY]` `src/libs/googleapis.ts`
```diff
@@ line 1 @@
 import { env } from '@/config';
-import { GOOGLE_SCOPES } from '@/constants';
 import axios from 'axios';
 
+export const GOOGLE_SCOPES = [
+    'email', // Lấy địa chỉ email của người dùng
+    'profile', // Lấy thông tin profile cơ bản của người dùng (tên, avatar, ...)
+    'https://www.googleapis.com/auth/drive.metadata.readonly', // Đọc metadata file & thư mục
+    'https://www.googleapis.com/auth/drive.readonly', // Truy cập chỉ-đọc vào tất cả file, thư mục
+];
+
 export interface IGoogleExchangeCodeRequest {
```

---

### 12. `[NEW]` `src/app/(root)/dashboard/constants/recent-data.constants.ts`
```typescript
export const recentFiles = [
    {
        id: 1,
        name: 'Báo cáo Q2 2023.docx',
        type: 'doc',
        modified: '2 giờ trước',
        icon: 'logos:google-docs',
    },
    {
        id: 2,
        name: 'Phân tích doanh thu.xlsx',
        type: 'sheet',
        modified: '1 ngày trước',
        icon: 'logos:google-sheets',
    },
    {
        id: 3,
        name: 'Kế hoạch marketing.pdf',
        type: 'pdf',
        modified: '3 ngày trước',
        icon: 'logos:adobe-acrobat-reader',
    },
    {
        id: 4,
        name: 'Thuyết trình dự án.pptx',
        type: 'slide',
        modified: '1 tuần trước',
        icon: 'logos:google-slides',
    },
    {
        id: 5,
        name: 'Hợp đồng khách hàng.docx',
        type: 'doc',
        modified: '2 tuần trước',
        icon: 'logos:google-docs',
    },
];

export const recentPhotos = [
    { id: 1, url: 'https://img.heroui.chat/image/landscape?w=300&h=200&u=1' },
    { id: 2, url: 'https://img.heroui.chat/image/landscape?w=300&h=200&u=2' },
    { id: 3, url: 'https://img.heroui.chat/image/landscape?w=300&h=200&u=3' },
    { id: 4, url: 'https://img.heroui.chat/image/landscape?w=300&h=200&u=4' },
    { id: 5, url: 'https://img.heroui.chat/image/landscape?w=300&h=200&u=5' },
    { id: 6, url: 'https://img.heroui.chat/image/landscape?w=300&h=200&u=6' },
];

export const recentNotes = [
    {
        id: 1,
        title: 'Họp nhóm dự án',
        content:
            'Thảo luận về tiến độ và phân công công việc cho tuần tới. Cần hoàn thành báo cáo trước thứ 6.',
        color: '#FEF3C7',
        modified: '1 giờ trước',
    },
    {
        id: 2,
        title: 'Danh sách mua sắm',
        content: '- Sữa\n- Trứng\n- Bánh mì\n- Rau xanh\n- Trái cây',
        color: '#DCFCE7',
        modified: '3 giờ trước',
    },
    {
        id: 3,
        title: 'Ý tưởng cho dự án mới',
        content:
            'Tích hợp AI vào hệ thống quản lý khách hàng để tự động hóa phân loại và phản hồi email.',
        color: '#DBEAFE',
        modified: '1 ngày trước',
    },
];
```

---

### 13. `[NEW]` `src/app/(root)/dashboard/constants/metrics-data.constants.ts`
```typescript
export const storageData = [
    { name: 'Google Drive', value: 2.8, color: '#4285F4' },
    { name: 'Google Photos', value: 1.2, color: '#34A853' },
    { name: 'Google Keep', value: 0.2, color: '#FBBC04' },
    { name: 'Còn trống', value: 11.8, color: '#E8EAED' },
];

export const activityData = [
    { date: '01/06', files: 5, photos: 8, notes: 2 },
    { date: '02/06', files: 3, photos: 12, notes: 1 },
    { date: '03/06', files: 7, photos: 5, notes: 3 },
    { date: '04/06', files: 2, photos: 15, notes: 0 },
    { date: '05/06', files: 6, photos: 10, notes: 4 },
    { date: '06/06', files: 8, photos: 7, notes: 2 },
    { date: '07/06', files: 4, photos: 9, notes: 5 },
];
```

---

### 14. `[NEW]` `src/app/(root)/dashboard/constants/index.ts`
```typescript
export * from './recent-data.constants';
export * from './metrics-data.constants';
```

---

### 15. `[DELETE]` `src/app/(root)/dashboard/constants.ts`
> **Action**: Xóa file `src/app/(root)/dashboard/constants.ts` sau khi đã chuyển vào `constants/`.

---

### 16. `[NEW]` `src/app/(root)/google/drive/photos/constants/view.constants.ts`
```typescript
import { ViewFileMode } from '@/enums';
import { FilterItem } from '@/interfaces';
import { QualityMode } from '../enums';

type FilterOptions = NonNullable<FilterItem['options']>;

export const viewModeOptions: FilterOptions = [
    { value: ViewFileMode.ALL, label: 'Xem tất cả' },
    { value: ViewFileMode.DATE, label: 'Xem theo ngày' },
    { value: ViewFileMode.FOLDER, label: 'Xem theo thư mục' },
];

export const qualityModeOptions: FilterOptions = [
    { value: QualityMode.HIGH, label: 'Nét' },
    { value: QualityMode.LOW, label: 'Thường' },
];

export const columnOptions: FilterOptions = [1, 2, 3, 4, 8].map((item) => ({
    value: item,
    label: item.toString(),
}));
```

---

### 17. `[NEW]` `src/app/(root)/google/drive/photos/constants/slideshow.constants.ts`
```typescript
export const SLIDESHOW_DELAY_OPTIONS = [
    { value: 1000, label: '1 giây' },
    { value: 2000, label: '2 giây' },
    { value: 3000, label: '3 giây' },
    { value: 5000, label: '5 giây' },
    { value: 10000, label: '10 giây' },
];

export const SLIDESHOW_DELAY_DEFAULT = 1000;
```

---

### 18. `[NEW]` `src/app/(root)/google/drive/photos/constants/filter.constants.ts`
```typescript
export const filterSearch = {
    span: 14,
    name: 'name',
    placeholder: 'Tìm kiếm ảnh',
};

export const ITEMS_PER_PAGE_OPTIONS = [
    { value: 0, label: 'Tất cả' },
    { value: 20, label: '20 ảnh' },
    { value: 50, label: '50 ảnh' },
    { value: 100, label: '100 ảnh' },
];

export const ITEMS_PER_PAGE_DEFAULT = 50;
```

---

### 19. `[NEW]` `src/app/(root)/google/drive/photos/constants/index.ts`
```typescript
export * from './view.constants';
export * from './slideshow.constants';
export * from './filter.constants';
```

---

### 20. `[DELETE]` `src/app/(root)/google/drive/photos/constants.ts`
> **Action**: Xóa file `src/app/(root)/google/drive/photos/constants.ts`.

---

### 21. `[NEW]` `src/app/(root)/google/keep/constants/keep-options.constants.ts`
```typescript
export const colorOptions = [
    { value: '#FFFFFF', label: 'Mặc định' },
    { value: '#FEF3C7', label: 'Vàng nhạt' },
    { value: '#DCFCE7', label: 'Xanh lá nhạt' },
    { value: '#DBEAFE', label: 'Xanh dương nhạt' },
    { value: '#FEE2E2', label: 'Đỏ nhạt' },
    { value: '#F3E8FF', label: 'Tím nhạt' },
    { value: '#E0F2FE', label: 'Xanh da trời' },
    { value: '#FEFCE8', label: 'Vàng nghệ' },
];

export const labelOptions = ['Công việc', 'Cá nhân', 'Ý tưởng', 'Quan trọng', 'Dự án', 'Mua sắm'];

export const sortMenu = [
    { key: 'date', label: 'Ngày chỉnh sửa' },
    { key: 'title', label: 'Tiêu đề' },
    { key: 'color', label: 'Màu sắc' },
];
```

---

### 22. `[NEW]` `src/app/(root)/google/keep/constants/keep-initial-data.constants.ts`
```typescript
import { Note } from '../types';

export const initialNotes: Note[] = [
    {
        id: 1,
        title: 'Họp nhóm dự án',
        content:
            'Thảo luận về tiến độ và phân công công việc cho tuần tới. Cần hoàn thành báo cáo trước thứ 6.',
        color: '#FEF3C7',
        isPinned: true,
        isChecklist: false,
        modified: '1 giờ trước',
    },
    {
        id: 2,
        title: 'Danh sách mua sắm',
        content: '- Sữa\n- Trứng\n- Bánh mì\n- Rau xanh\n- Trái cây',
        color: '#DCFCE7',
        isPinned: false,
        isChecklist: true,
        modified: '3 giờ trước',
    },
    {
        id: 3,
        title: 'Ý tưởng cho dự án mới',
        content:
            'Tích hợp AI vào hệ thống quản lý khách hàng để tự động hóa phân loại và phản hồi email.',
        color: '#DBEAFE',
        isPinned: true,
        isChecklist: false,
        modified: '1 ngày trước',
    },
    {
        id: 4,
        title: '',
        content: 'Gọi điện cho khách hàng A vào thứ 2 tuần sau.',
        color: '#FEE2E2',
        isPinned: false,
        isChecklist: false,
        modified: '2 ngày trước',
    },
    {
        id: 5,
        title: 'Lịch hẹn tháng 6',
        content:
            '- 5/6: Họp với đối tác\n- 10/6: Đi khám sức khỏe\n- 15/6: Deadline dự án X\n- 20/6: Sinh nhật mẹ',
        color: '#FEFCE8',
        isPinned: false,
        isChecklist: true,
        modified: '3 ngày trước',
    },
    {
        id: 6,
        title: 'Ý tưởng tên sản phẩm',
        content: '1. FlexiSync\n2. ConnectHub\n3. IntegrateFlow\n4. SmartBridge\n5. LinkMaster',
        color: '#F3E8FF',
        isPinned: false,
        isChecklist: false,
        modified: '1 tuần trước',
    },
    {
        id: 7,
        title: 'Mục tiêu quý 3',
        content:
            '- Tăng doanh số 15%\n- Ra mắt tính năng mới\n- Mở rộng thị trường khu vực B\n- Tuyển thêm 2 nhân viên marketing',
        color: '#E0F2FE',
        isPinned: false,
        isChecklist: true,
        modified: '1 tuần trước',
    },
];

export const initialNoteLabels: { [key: number]: string[] } = {
    1: ['Công việc', 'Quan trọng'],
    3: ['Ý tưởng'],
    5: ['Cá nhân'],
};
```

---

### 23. `[NEW]` `src/app/(root)/google/keep/constants/index.ts`
```typescript
export * from './keep-options.constants';
export * from './keep-initial-data.constants';
```

---

### 24. `[DELETE]` `src/app/(root)/google/keep/constants.ts`
> **Action**: Xóa file `src/app/(root)/google/keep/constants.ts`.

---

### 25. `[NEW]` `src/app/(root)/scraping/data-providers/constants/data-provider-form.constants.ts`
```typescript
import type { DataProviderFormValues } from '../types';

export const DATA_PROVIDER_INITIAL_VALUES: DataProviderFormValues = {
    name: '',
    baseUrl: '',
    identifier: '',
};

export const DATA_PROVIDER_LIMITS = {
    NAME_MAX_LENGTH: 255,
    IDENTIFIER_MAX_LENGTH: 20,
} as const;
```

---

### 26. `[NEW]` `src/app/(root)/scraping/data-providers/constants/data-provider-table.constants.ts`
```typescript
export const DATA_PROVIDER_COLUMNS_WIDTH = {
    NAME: '25%',
    IDENTIFIER: '15%',
    BASE_URL: '30%',
    CREATED_AT: '15%',
} as const;
```

---

### 27. `[NEW]` `src/app/(root)/scraping/data-providers/constants/index.ts`
```typescript
export * from './data-provider-form.constants';
export * from './data-provider-table.constants';
```

---

### 28. `[DELETE]` `src/app/(root)/scraping/data-providers/constants.ts`
> **Action**: Xóa file `src/app/(root)/scraping/data-providers/constants.ts`.

---

### 29. `[NEW]` `src/app/(root)/scraping/discovery/constants/discovery-status.constants.ts`
```typescript
// eslint-disable-next-line no-restricted-imports
import type { PresetStatusColorType } from 'antd/es/_util/colors';
import { DiscoverySessionStatus } from '../enums';

export const DISCOVERY_SESSION_STATUS_COLOR_MAP: Record<
    DiscoverySessionStatus,
    PresetStatusColorType | string
> = {
    [DiscoverySessionStatus.COMPLETED]: 'success',
    [DiscoverySessionStatus.IN_PROGRESS]: 'processing',
    [DiscoverySessionStatus.FAILED]: 'error',
    [DiscoverySessionStatus.PENDING]: 'default',
};

export const DISCOVERY_SESSION_STATUS_LABELS: Record<DiscoverySessionStatus, string> = {
    [DiscoverySessionStatus.COMPLETED]: 'Hoàn thành',
    [DiscoverySessionStatus.IN_PROGRESS]: 'Đang xử lý',
    [DiscoverySessionStatus.FAILED]: 'Thất bại',
    [DiscoverySessionStatus.PENDING]: 'Chờ xử lý',
};
```

---

### 30. `[NEW]` `src/app/(root)/scraping/discovery/constants/discovery-form.constants.ts`
```typescript
export const DEFAULT_CREATE_SESSION_VALUES = {
    depth: 1,
    maxUrls: 50,
} as const;
```

---

### 31. `[NEW]` `src/app/(root)/scraping/discovery/constants/index.ts`
```typescript
export * from './discovery-status.constants';
export * from './discovery-form.constants';
```

---

### 32. `[DELETE]` `src/app/(root)/scraping/discovery/constants.ts`
> **Action**: Xóa file `src/app/(root)/scraping/discovery/constants.ts`.

---

### 33. `[NEW]` `src/app/(root)/scraping/scraping-data/constants/filter.constants.ts`
```typescript
import { DisplayMode, ViewFileMode } from '@/enums';
import { FilterItem } from '@/interfaces';

type FilterOptions = NonNullable<FilterItem['options']>;

export const dataTypeOptions: FilterOptions = [
    { label: 'Ảnh', value: 'image' },
    { label: 'Video', value: 'video' },
    { label: 'Tài liệu', value: 'document' },
];

export const viewModeOptions: FilterOptions = [
    { value: ViewFileMode.ALL, label: 'Xem tất cả' },
    { value: ViewFileMode.DATE, label: 'Xem theo ngày' },
    { value: ViewFileMode.FOLDER, label: 'Xem theo thư mục' },
];

export const columnDisplayOptions: FilterOptions = [1, 2, 3, 4, 8].map((item) => ({
    value: item,
    label: item.toString(),
}));

export const getFilterSearch = (displayMode: DisplayMode) => ({
    placeholder: 'Tìm kiếm lịch sử dữ liệu',
    span: displayMode === DisplayMode.TABLE ? 8 : 6,
});
```

---

### 34. `[NEW]` `src/app/(root)/scraping/scraping-data/constants/index.ts`
```typescript
export * from './filter.constants';
```

---

### 35. `[DELETE]` `src/app/(root)/scraping/scraping-data/constants.ts`
> **Action**: Xóa file `src/app/(root)/scraping/scraping-data/constants.ts`.

---

### 36. `[DELETE]` `src/constants/data-provider.constant.ts`
> **Action**: Xóa file `src/constants/data-provider.constant.ts`.

---

### 37. `[DELETE]` `src/constants/auth-errors.constant.ts`
> **Action**: Xóa file `src/constants/auth-errors.constant.ts`.

---

### 38. `[DELETE]` `src/constants/common.constant.ts`
> **Action**: Xóa file `src/constants/common.constant.ts`.

---

### 39. `[MODIFY]` `src/constants/index.ts`
```diff
@@ line 1 @@
-export * from './auth-errors.constant';
-export * from './common.constant';
-export * from './data-provider.constant';
+export * from './auth.constant';
+export * from './date.constant';
 export * from './font.constant';
 export * from './hub-theme.constant';
+export * from './pagination.constant';
 export * from './sidebar.constant';
 export * from './socket.constant';
+export * from './storage.constant';
+export * from './system.constant';
```

## Section 5. Test Cases & Verification

- **Automated Verification**:
  - `[x]` `npm run build`: PASS — Toàn bộ 28 routes và pages compile thành công với Turbopack và TypeScript check (0 errors).
  - `[x]` `npx eslint src/`: PASS — 0 errors, 0 warnings.
  - `[x]` `npm run format`: PASS — Toàn bộ codebase được định dạng đồng bộ với Prettier.
- **Manual Verification**:
  - `[x]` Dashboard: Danh sách `recentFiles`, `recentPhotos`, `recentNotes`, biểu đồ `storageData`, `activityData` hoạt động trơn tru.
  - `[x]` Google Drive Photos: Xem ảnh, chọn chất lượng, chế độ cột, slideshow options hoạt động chuẩn xác.
  - `[x]` Google Keep: Bộ lọc màu sắc, tag nhãn, danh sách note mẫu hiển thị đúng.
  - `[x]` Scraping Data Providers: Modal tạo mới và độ rộng bảng hiển thị đúng.
  - `[x]` Scraping Discovery: Status badge màu sắc và giá trị mặc định form tạo session hoạt động chuẩn xác.
  - `[x]` Scraping Features: Cấu hình template sinh mã hoạt động hoàn hảo trong modal config và tab test sandbox.

