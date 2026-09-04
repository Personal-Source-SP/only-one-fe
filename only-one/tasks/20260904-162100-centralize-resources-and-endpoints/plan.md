---
status: done
slug: centralize-resources-and-endpoints
started_at: 2026-09-04
completed_at: 2026-09-04
pr_url: ~
branch: ~
---

# Plan: Chuẩn hóa Toàn diện Constants Resource & API Endpoint

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- Tại nhiều trang danh sách (`DataProviderPage`, `ItemsPage`, `ProviderItemsPage`, `CloudDataItemsPage`, `UsersPage`, ...), thuộc tính `deleteResource` trong `<ListTable>` đang nhận các chuỗi thô hardcode (`"data-providers"`, `"items"`, `"cloud-data-items"`, ...).
- Endpoint `CLOUD_DATA_ITEMS` đang bị thiếu trong `src/config/endpoint.ts`, dẫn đến `useCloudDataItemPage` phải truyền trực tiếp string `'cloud-data-items'`.
- **Invariants bắt buộc giữ nguyên**:
  - Giá trị chuỗi thực tế của từng resource path phải không đổi để đảm bảo các API call (`useCustomTable`, `useCustomDelete`, `useCustomModalForm`) trỏ đúng endpoint backend.
  - Tuân thủ quy tắc import `@/config` cho toàn bộ các constant dùng chung.

## Section 2. Detailed Design (Thiết kế Kỹ thuật Chi tiết)
- **Cập nhật `src/config/endpoint.ts`**:
  - Bổ sung `CLOUD_DATA_ITEMS` vào `API_ENDPOINT`:
    - `BASE`: `'cloud-data-items'`
    - `ALL`: `'cloud-data-items/all'`
    - `DETAIL`: `(id) => 'cloud-data-items/' + id`
    - `UPLOAD`: `'cloud-data-items/upload'`
  - Khởi tạo hằng số `RESOURCE` gom tất cả các resource keys chuẩn hóa:
    ```typescript
    export const RESOURCE = {
        DATA_PROVIDERS: API_ENDPOINT.DATA_PROVIDERS.BASE,
        DATA_PROVIDER_FEATURES: API_ENDPOINT.DATA_PROVIDER_FEATURES.BASE,
        DATA_PROVIDER_ITEMS: API_ENDPOINT.DATA_PROVIDER_ITEMS.BASE,
        ITEMS: API_ENDPOINT.ITEMS.BASE,
        SCRAPING_DATA: API_ENDPOINT.SCRAPING_DATA.BASE,
        DISCOVERY_SESSIONS: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
        DISCOVERY_URLS: API_ENDPOINT.DISCOVERY_URLS.BASE,
        SCHEDULES: API_ENDPOINT.SCHEDULES.BASE,
        SCHEDULE_JOBS: API_ENDPOINT.SCHEDULE_JOBS.BASE,
        SCHEDULE_JOB_EVENTS: API_ENDPOINT.SCHEDULE_JOB_EVENTS.BASE,
        GOOGLE_FOLDERS: API_ENDPOINT.GOOGLE_DRIVE.FOLDERS,
        GOOGLE_FILES: API_ENDPOINT.GOOGLE_DRIVE.FILES,
        CLOUD_DATA_PROVIDERS: API_ENDPOINT.CLOUD_DATA_PROVIDERS.BASE,
        CLOUD_DATA_ITEMS: API_ENDPOINT.CLOUD_DATA_ITEMS.BASE,
        SIMULATION_CONTEXTS: API_ENDPOINT.SIMULATION.CONTEXTS,
        SIMULATION_ITEMS: API_ENDPOINT.SIMULATION.ITEMS,
        USERS: API_ENDPOINT.USERS.BASE,
        NOTIFICATIONS: API_ENDPOINT.NOTIFICATIONS.BASE,
        SETTINGS: API_ENDPOINT.SETTINGS.BASE,
    } as const;
    ```
- **Refactor các trang và hooks**:
  - Áp dụng `RESOURCE.<NAME>` cho `deleteResource` và `resource` trong `useCustomTable` / `useCustomModalForm`.

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/config/endpoint.ts` | `API_ENDPOINT.CLOUD_DATA_ITEMS`, `RESOURCE` | `prefix helper` | `None` | `npm run lint` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/page.tsx` | `ListTable (deleteResource)` | `@/config (RESOURCE)` | `Order 1` | `npm run lint` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/items/page.tsx` | `ListTable (deleteResource)` | `@/config (RESOURCE)` | `Order 1` | `npm run lint` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/provider-items/page.tsx` | `ListTable (deleteResource)` | `@/config (RESOURCE)` | `Order 1` | `npm run lint` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/scraping-data/page.tsx` | `ListTable (deleteResource)` | `@/config (RESOURCE)` | `Order 1` | `npm run lint` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/providers/page.tsx` | `ListTable (deleteResource)` | `@/config (RESOURCE)` | `Order 1` | `npm run lint` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/items/page.tsx` | `ListTable (deleteResource)` | `@/config (RESOURCE)` | `Order 1` | `npm run lint` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/items/hooks.ts` | `useCustomTable`, `useCustomModalForm` | `@/config (RESOURCE, API_ENDPOINT)` | `Order 1` | `npm run lint` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/contexts/page.tsx` | `ListTable (deleteResource)` | `@/config (RESOURCE)` | `Order 1` | `npm run lint` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/items/page.tsx` | `ListTable (deleteResource)` | `@/config (RESOURCE)` | `Order 1` | `npm run lint` |
| **11** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/page.tsx` | `ListTable (deleteResource)` | `@/config (RESOURCE)` | `Order 1` | `npm run lint` |
| **12** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/folders/page.tsx` | `ListTable (deleteResource)` | `@/config (RESOURCE)` | `Order 1` | `npm run lint` |
| **13** | `[x]` | `[MODIFY]` | `src/app/(root)/setting/users/page.tsx` | `ListTable (deleteResource)` | `@/config (RESOURCE)` | `Order 1` | `npm run lint` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/config/endpoint.ts`
> **Action**: Bổ sung `CLOUD_DATA_ITEMS` vào `API_ENDPOINT` và export hằng số `RESOURCE`.

```diff
@@ -97,2 +97,8 @@
     },
+    CLOUD_DATA_ITEMS: {
+        BASE: prefix('cloud-data-items'),
+        ALL: prefix('cloud-data-items/all'),
+        DETAIL: (id: string | number) => prefix(`cloud-data-items/${id}`),
+        UPLOAD: prefix('cloud-data-items/upload'),
+    },
     SIMULATION: {
@@ -118,2 +124,24 @@
 } as const;
+
+export const RESOURCE = {
+    DATA_PROVIDERS: API_ENDPOINT.DATA_PROVIDERS.BASE,
+    DATA_PROVIDER_FEATURES: API_ENDPOINT.DATA_PROVIDER_FEATURES.BASE,
+    DATA_PROVIDER_ITEMS: API_ENDPOINT.DATA_PROVIDER_ITEMS.BASE,
+    ITEMS: API_ENDPOINT.ITEMS.BASE,
+    SCRAPING_DATA: API_ENDPOINT.SCRAPING_DATA.BASE,
+    DISCOVERY_SESSIONS: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
+    DISCOVERY_URLS: API_ENDPOINT.DISCOVERY_URLS.BASE,
+    SCHEDULES: API_ENDPOINT.SCHEDULES.BASE,
+    SCHEDULE_JOBS: API_ENDPOINT.SCHEDULE_JOBS.BASE,
+    SCHEDULE_JOB_EVENTS: API_ENDPOINT.SCHEDULE_JOB_EVENTS.BASE,
+    GOOGLE_FOLDERS: API_ENDPOINT.GOOGLE_DRIVE.FOLDERS,
+    GOOGLE_FILES: API_ENDPOINT.GOOGLE_DRIVE.FILES,
+    CLOUD_DATA_PROVIDERS: API_ENDPOINT.CLOUD_DATA_PROVIDERS.BASE,
+    CLOUD_DATA_ITEMS: API_ENDPOINT.CLOUD_DATA_ITEMS.BASE,
+    SIMULATION_CONTEXTS: API_ENDPOINT.SIMULATION.CONTEXTS,
+    SIMULATION_ITEMS: API_ENDPOINT.SIMULATION.ITEMS,
+    USERS: API_ENDPOINT.USERS.BASE,
+    NOTIFICATIONS: API_ENDPOINT.NOTIFICATIONS.BASE,
+    SETTINGS: API_ENDPOINT.SETTINGS.BASE,
+} as const;
```

### 2. `[MODIFY]` `src/app/(root)/scraping/data-providers/page.tsx`
> **Action**: Dùng `RESOURCE.DATA_PROVIDERS` cho `deleteResource`.

```diff
@@ -13,2 +13,3 @@
 import { PlusOutlined } from '@ant-design/icons';
+import { RESOURCE } from '@/config';
 import { useRouter } from 'next/navigation';

@@ -134,1 +135,1 @@
-                    deleteResource="data-providers"
+                    deleteResource={RESOURCE.DATA_PROVIDERS}
```

### 3. `[MODIFY]` `src/app/(root)/scraping/items/page.tsx`
> **Action**: Dùng `RESOURCE.ITEMS` cho `deleteResource`.

```diff
@@ -141,1 +141,1 @@
-                    deleteResource="items"
+                    deleteResource={RESOURCE.ITEMS}
```

### 4. `[MODIFY]` `src/app/(root)/scraping/provider-items/page.tsx`
> **Action**: Dùng `RESOURCE.DATA_PROVIDER_ITEMS` cho `deleteResource`.

```diff
@@ -165,1 +165,1 @@
-                    deleteResource="data-provider-items"
+                    deleteResource={RESOURCE.DATA_PROVIDER_ITEMS}
```

### 5. `[MODIFY]` `src/app/(root)/scraping/scraping-data/page.tsx`
> **Action**: Dùng `RESOURCE.SCRAPING_DATA` cho `deleteResource`.

```diff
@@ -194,1 +194,1 @@
-                    deleteResource="scraping-data"
+                    deleteResource={RESOURCE.SCRAPING_DATA}
```

### 6. `[MODIFY]` `src/app/(root)/cloud-data/providers/page.tsx`
> **Action**: Dùng `RESOURCE.CLOUD_DATA_PROVIDERS` cho `deleteResource`.

```diff
@@ -138,1 +138,1 @@
-                    deleteResource="cloud-data-providers"
+                    deleteResource={RESOURCE.CLOUD_DATA_PROVIDERS}
```

### 7. `[MODIFY]` `src/app/(root)/cloud-data/items/page.tsx` & `hooks.ts`
> **Action**: Dùng `RESOURCE.CLOUD_DATA_ITEMS` và `API_ENDPOINT.CLOUD_DATA_ITEMS.UPLOAD`.

```diff
// page.tsx
-                    deleteResource="cloud-data-items"
+                    deleteResource={RESOURCE.CLOUD_DATA_ITEMS}

// hooks.ts
-            resource: 'cloud-data-items',
+            resource: RESOURCE.CLOUD_DATA_ITEMS,
-        resource: 'cloud-data-items/upload',
+        resource: API_ENDPOINT.CLOUD_DATA_ITEMS.UPLOAD,
```

### 8. `[MODIFY]` `src/app/(root)/simulation/contexts/page.tsx`
> **Action**: Dùng `RESOURCE.SIMULATION_CONTEXTS` cho `deleteResource`.

```diff
@@ -107,1 +107,1 @@
-                    deleteResource="simulation-contexts"
+                    deleteResource={RESOURCE.SIMULATION_CONTEXTS}
```

### 9. `[MODIFY]` `src/app/(root)/simulation/items/page.tsx`
> **Action**: Dùng `RESOURCE.SIMULATION_ITEMS` cho `deleteResource`.

```diff
@@ -148,1 +148,1 @@
-                    deleteResource="simulation-items"
+                    deleteResource={RESOURCE.SIMULATION_ITEMS}
```

### 10. `[MODIFY]` `src/app/(root)/schedule/executions/page.tsx`
> **Action**: Dùng `RESOURCE.SCHEDULES` cho `deleteResource`.

```diff
@@ -165,1 +165,1 @@
-                    deleteResource="schedules"
+                    deleteResource={RESOURCE.SCHEDULES}
```

### 11. `[MODIFY]` `src/app/(root)/google/drive/folders/page.tsx`
> **Action**: Dùng `RESOURCE.GOOGLE_FOLDERS` cho `deleteResource`.

```diff
@@ -141,1 +141,1 @@
-                    deleteResource="google-folder"
+                    deleteResource={RESOURCE.GOOGLE_FOLDERS}
```

### 12. `[MODIFY]` `src/app/(root)/setting/users/page.tsx`
> **Action**: Dùng `RESOURCE.USERS` cho `deleteResource`.

```diff
@@ -176,1 +176,1 @@
-                    deleteResource="users"
+                    deleteResource={RESOURCE.USERS}
```

## Section 5. Test Cases & Verification
- **Automated Verification**:
  - Chạy `npm run lint` để kiểm tra TypeScript compilation và eslint rules.
- **Manual Checks**:
  1. Kiểm tra chức năng xóa trên các trang danh sách hoạt động ổn định.
