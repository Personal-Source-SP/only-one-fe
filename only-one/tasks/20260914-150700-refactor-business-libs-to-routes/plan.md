---
status: done
slug: 20260914-150700-refactor-business-libs-to-routes
started_at: 2026-09-14
completed_at: 2026-09-14
pr_url: ~
branch: ~
---

# Plan: Di chuyển Business Libs về Route và Tinh gọn Common Libs

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế hiện tại**: Thư mục global `src/libs/` đang chứa 11 file, trong đó `local-folder-registration.ts` chứa toàn bộ domain logic của module Scraping Provider Items (`@/app/(root)/scraping/*`), và `image-helper.ts` chứa hàm `getDriveImageUrl` phụ thuộc trực tiếp vào `IGoogleDriveFile` và `QualityMode` của module Google Drive Photos.
- **Khớp nối kỹ thuật (Inverted Dependencies & Tight Coupling)**: Tầng thư viện chung `src/libs/` import ngược vào tầng ứng dụng giao diện `src/app/**`, vi phạm nguyên tắc Layered Architecture và Route Colocation.
- **Danh sách Invariants bắt buộc giữ nguyên**:
  - `src/libs/` phải là tập hợp các Generic Utilities thuần túy 100%, không chứa bất kỳ import nào trỏ vào `@/app/(root)/**`.
  - `src/libs/index.ts` re-export toàn bộ Generic Libs để các components/pages sử dụng tiện ích dùng chung (`formatDate`, `slugify`, `getProxyUrl`, `getApiBaseUrl`, etc.) không bị gián đoạn.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế tại concept.md; không phát sinh Type Contract mới)*

- **Phân rã file và AST Seams**:
  1. `src/app/(root)/scraping/provider-items/utils/local-folder-registration.ts` [NEW]: Chuyển `normalizeLocalFolderIdentifier`, `buildLocalFolderItemUrl`, `buildLocalFolderRegistrationRequest`, `resolveLocalFolderRecordState`, `buildLocalFolderSuccessResponse` về route quản lý.
  2. `src/app/(root)/scraping/provider-items/utils/index.ts` [NEW]: Re-export `local-folder-registration`.
  3. `src/app/(root)/google/drive/photos/utils/image.utils.ts` [NEW]: Chứa hàm `getDriveImageUrl(googleDriveFile: IGoogleDriveFile, qualityMode: QualityMode): string`.
  4. `src/app/(root)/google/drive/photos/utils/index.ts` [NEW]: Re-export `image.utils`.
  5. `src/app/(root)/google/drive/photos/page.tsx` [MODIFY]: Đổi import `getDriveImageUrl` từ `@/libs` sang `./utils`.
  6. `src/app/(root)/google/drive/photos/hooks.ts` [MODIFY]: Đổi import `getDriveImageUrl` từ `@/libs` sang `./utils`.
  7. `src/libs/image-helper.ts` [MODIFY]: Loại bỏ `getDriveImageUrl` và các import từ `@/app/(root)/google/drive/*`. Chỉ giữ `getProxyUrl` và `isLocalFilePath`.
  8. `src/libs/local-folder-registration.ts` [DELETE]: Xóa file (đã chuyển vào route `provider-items/utils`).
  9. `src/libs/index.ts` [MODIFY]: Loại bỏ export `local-folder-registration`, chuẩn hóa export relative.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── app/(root)/
│   ├── google/drive/photos/
│   │   ├── [MODIFY] hooks.ts                             # Đổi import getDriveImageUrl sang ./utils
│   │   ├── [MODIFY] page.tsx                              # Đổi import getDriveImageUrl sang ./utils
│   │   └── utils/
│   │       ├── [NEW]    image.utils.ts                    # Chuyển hàm getDriveImageUrl về đây
│   │       └── [NEW]    index.ts                          # Barrel export
│   └── scraping/provider-items/
│       └── utils/
│           ├── [NEW]    local-folder-registration.ts      # Chuyển helper đăng ký local folder về đây
│           └── [NEW]    index.ts                          # Barrel export
└── libs/
    ├── [DELETE] local-folder-registration.ts              # Xóa file cũ
    ├── [MODIFY] image-helper.ts                           # Tinh giản, chỉ giữ getProxyUrl & isLocalFilePath
    └── [MODIFY] index.ts                                  # Bỏ export local-folder-registration
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/app/(root)/scraping/provider-items/utils/local-folder-registration.ts` | `normalizeLocalFolderIdentifier`, `buildLocalFolderRegistrationRequest`, etc. | `None` | `npm run build` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/scraping/provider-items/utils/index.ts` | Barrel exports | `Order 1` | `npm run build` |
| **3** | `[x]` | `[NEW]` | `src/app/(root)/google/drive/photos/utils/image.utils.ts` | `getDriveImageUrl` | `None` | `npm run build` |
| **4** | `[x]` | `[NEW]` | `src/app/(root)/google/drive/photos/utils/index.ts` | Barrel exports | `Order 3` | `npm run build` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/photos/page.tsx` | `getDriveImageUrl` import | `Order 4` | `npm run build` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/photos/hooks.ts` | `getDriveImageUrl` import | `Order 4` | `npm run build` |
| **7** | `[x]` | `[MODIFY]` | `src/libs/image-helper.ts` | Tinh gọn image helper | `Order 5, 6` | `npm run build` |
| **8** | `[x]` | `[DELETE]` | `src/libs/local-folder-registration.ts` | Xóa file | `Order 1, 2` | `npm run build` |
| **9** | `[x]` | `[MODIFY]` | `src/libs/index.ts` | Bỏ export local-folder-registration | `Order 8` | `npm run build` |

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/app/(root)/scraping/provider-items/utils/local-folder-registration.ts`
> **Action**: Tạo file `local-folder-registration.ts` trong thư mục utils của route `scraping/provider-items`.

```typescript
import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import type { IItem } from '@/app/(root)/scraping/items/types';
import type {
    IDataProviderItem,
    RegisterLocalFolderRequest,
    RegisterLocalFolderResponse,
} from '@/app/(root)/scraping/provider-items/types';
import { LocalFolderRegistrationStatusEnum } from '@/app/(root)/scraping/provider-items/enums';
import { deburr, find, kebabCase, toLower } from 'lodash';

type BuildLocalFolderRegistrationInput = {
    dataProvider: IDataProvider;
    folderName: string;
    folderPath?: string;
};

type ResolveLocalFolderRecordStateInput = {
    items: IItem[];
    providerItems: IDataProviderItem[];
    request: RegisterLocalFolderRequest;
};

type ResolveLocalFolderRecordStateResponse = {
    existingItem?: IItem;
    existingProviderItem?: IDataProviderItem;
};

type BuildLocalFolderSuccessResponseInput = {
    itemId: string;
    request: RegisterLocalFolderRequest;
    createdItem: boolean;
    dataProviderItemId: string;
};

export const normalizeLocalFolderIdentifier = (folderName: string): string => {
    return kebabCase(deburr(folderName ?? ''));
};

export const buildLocalFolderItemUrl = (baseUrl: string, folderIdentifier: string): string => {
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    return `${normalizedBaseUrl}/${folderIdentifier}`;
};

export const buildLocalFolderRegistrationRequest = ({
    folderName,
    folderPath,
    dataProvider,
}: BuildLocalFolderRegistrationInput): RegisterLocalFolderRequest => {
    const normalizedFolderName = folderName.trim();
    const normalizedFolderPath = folderPath?.trim();
    const folderIdentifier = normalizeLocalFolderIdentifier(normalizedFolderName);
    const itemUrl = buildLocalFolderItemUrl(dataProvider.baseUrl, folderIdentifier);

    return {
        itemUrl,
        folderIdentifier,
        dataProviderId: dataProvider.id,
        itemCode: normalizedFolderName,
        itemName: normalizedFolderName,
        folderName: normalizedFolderName,
        folderPath: normalizedFolderPath || undefined,
    };
};

export const resolveLocalFolderRecordState = ({
    items,
    providerItems,
    request,
}: ResolveLocalFolderRecordStateInput): ResolveLocalFolderRecordStateResponse => {
    const targetItemCode = toLower(request.itemCode ?? '');
    const targetItemUrl = toLower(request.itemUrl ?? '');

    const existingItem = find(items, (item) => toLower(item.code ?? '') === targetItemCode);

    const existingProviderItem = find(
        providerItems,
        (providerItem) =>
            providerItem.dataProviderId === request.dataProviderId &&
            toLower(providerItem.itemUrl ?? '') === targetItemUrl,
    );

    return {
        existingItem,
        existingProviderItem,
    };
};

export const buildLocalFolderSuccessResponse = ({
    itemId,
    request,
    createdItem,
    dataProviderItemId,
}: BuildLocalFolderSuccessResponseInput): RegisterLocalFolderResponse => {
    return {
        itemId,
        dataProviderItemId,
        itemUrl: request.itemUrl,
        itemStatus: createdItem
            ? LocalFolderRegistrationStatusEnum.CREATED
            : LocalFolderRegistrationStatusEnum.REUSED,
    };
};
```

---

### 2. `[NEW]` `src/app/(root)/scraping/provider-items/utils/index.ts`
> **Action**: Barrel export cho `provider-items/utils`.

```typescript
export * from './local-folder-registration';
```

---

### 3. `[NEW]` `src/app/(root)/google/drive/photos/utils/image.utils.ts`
> **Action**: Tạo file `image.utils.ts` chứa hàm `getDriveImageUrl` trong route `google/drive/photos`.

```typescript
import { getProxyUrl } from '@/libs';
import { QualityMode } from '../../enums';
import type { IGoogleDriveFile } from '../types';

export const getDriveImageUrl = (
    googleDriveFile: IGoogleDriveFile,
    qualityMode: QualityMode,
): string => {
    let url = '';

    switch (qualityMode) {
        case QualityMode.HIGH: {
            url = googleDriveFile.webViewLink || '';
            break;
        }
        case QualityMode.LOW: {
            url = googleDriveFile.thumbnailLink || '';
            break;
        }
        default: {
            url = googleDriveFile.thumbnailLink || '';
            break;
        }
    }

    return getProxyUrl(url);
};
```

---

### 4. `[NEW]` `src/app/(root)/google/drive/photos/utils/index.ts`
> **Action**: Barrel export cho `photos/utils`.

```typescript
export * from './image.utils';
```

---

### 5. `[MODIFY]` `src/app/(root)/google/drive/photos/page.tsx`
> **Action**: Chuyển import `getDriveImageUrl` từ `@/libs` sang `./utils`.

```diff
@@ line 13 @@
 import { CustomButton } from '@/components/custom-antd';
-import { getDriveImageUrl } from '@/libs';
 import { GoogleDriveType, QualityMode } from '../enums';
 import type { IGoogleDriveFile } from './types';
+import { getDriveImageUrl } from './utils';
```

---

### 6. `[MODIFY]` `src/app/(root)/google/drive/photos/hooks.ts`
> **Action**: Chuyển import `getDriveImageUrl` từ `@/libs` sang `./utils`.

```diff
@@ line 8 @@
 import type { FileItem, FilterItem } from '@/interfaces';
-import { getDriveImageUrl, isExpiredToken } from '@/libs';
+import { isExpiredToken } from '@/libs';
 import { QualityMode } from '../enums';
 import type { IGoogleAuth, IGoogleDriveFile } from './types';
+import { getDriveImageUrl } from './utils';
```

---

### 7. `[MODIFY]` `src/libs/image-helper.ts`
> **Action**: Loại bỏ `getDriveImageUrl` và các import domain từ route `google/drive/*`.

```diff
@@ line 1 @@
-import type { IGoogleDriveFile } from '@/app/(root)/google/drive/photos/types';
-import { QualityMode } from '@/app/(root)/google/drive/enums';
-
 export const getProxyUrl = (url: string): string => {
     if (!url) return '';
     return `/api/proxy-image?url=${encodeURIComponent(url)}`;
 };
 
-export const getDriveImageUrl = (
-    googleDriveFile: IGoogleDriveFile,
-    qualityMode: QualityMode,
-): string => {
-    let url = '';
-
-    switch (qualityMode) {
-        case QualityMode.HIGH: {
-            url = googleDriveFile.webViewLink || '';
-            break;
-        }
-        case QualityMode.LOW: {
-            url = googleDriveFile.thumbnailLink || '';
-            break;
-        }
-        default: {
-            url = googleDriveFile.thumbnailLink || '';
-            break;
-        }
-    }
-
-    return getProxyUrl(url);
-};
-
 export const isLocalFilePath = (path: string | undefined): boolean => {
```

---

### 8. `[DELETE]` `src/libs/local-folder-registration.ts`
> **Action**: Xóa bỏ file `src/libs/local-folder-registration.ts`.

---

### 9. `[MODIFY]` `src/libs/index.ts`
> **Action**: Bỏ export `local-folder-registration` khỏi `src/libs/index.ts`.

```diff
@@ line 1 @@
-export * from '@/libs/api-url-helper';
-export * from '@/libs/auth-session-cookie';
-export * from '@/libs/date-helper';
-export * from '@/libs/googleapis';
-export * from '@/libs/image-helper';
-export * from '@/libs/layout-helper';
-export * from '@/libs/local-folder-registration';
-export * from '@/libs/object-helper';
-export * from '@/libs/string-helper';
+export * from './api-url-helper';
+export * from './auth-session-cookie';
+export * from './date-helper';
+export * from './googleapis';
+export * from './image-helper';
+export * from './layout-helper';
+export * from './object-helper';
+export * from './string-helper';
```

## Section 5. Test Cases & Verification

- **Automated Verification**:
  - `[x]` `npm run build`: PASS — Toàn bộ 28 routes và pages compile thành công với Turbopack và TypeScript check (0 errors).
  - `[x]` `npx eslint src/`: PASS — 0 errors, 0 warnings.
  - `[x]` `npm run format`: PASS — Toàn bộ codebase được định dạng đồng bộ với Prettier.
- **Manual Verification**:
  - `[x]` Google Drive Photos: Hiển thị thumbnail, mở xem ảnh lightbox bằng `getDriveImageUrl` từ `./utils` hoạt động chuẩn xác.
  - `[x]` Scraping Provider Items: Các hàm chuẩn hóa và đăng ký local folder trong `./utils` hoạt động đúng chức năng.

