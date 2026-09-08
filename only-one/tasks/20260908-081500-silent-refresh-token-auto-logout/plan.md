---
status: done
slug: silent-refresh-token-auto-logout
started_at: 2026-09-08
completed_at: 2026-09-08
pr_url: ~
branch: ~
---

# Plan: Silent Refresh Token & Auto-Logout Mechanism

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Backend Auth Controller & Service Bug**:
  - `auth.controller.ts` gắn decorator `@Auth()` trên endpoint `POST /auth/refresh-token`. Khi Access Token của client đã hết hạn (`401`), `JwtAuthGuard` chặn ngay lập tức và trả về lỗi 401 trước khi vào method controller.
  - `auth.service.ts` giải mã JWT payload từ `dto.refreshToken` và đọc `payload.userId`, trong khi token được sinh ra từ `generateToken` lại lưu trường `id` (`payload.id`).
- **Frontend Axios Interceptor & Refine Session Handling**:
  - `data-provider.ts` khởi tạo `createSessionAxiosInstance` với biến `let isRefreshing = false` cục bộ trong error callback, không có hàng đợi request và không thực hiện gọi API refresh token hoặc kích hoạt đăng xuất khi gặp lỗi 401.
  - `RefineContext.tsx` trong `authProvider.onError` chỉ kiểm tra `error.response?.status === 401` thay vì bắt toàn diện `error?.statusCode === 401 || error?.status === 401 || error?.response?.status === 401`. Ngoài ra, `useEffect` chưa bắt trạng thái `session?.user?.error === 'RefreshAccessTokenError'` để tự động `signOut`.
  - `base.service.ts` khi gặp lỗi 401 chỉ xóa key storage và `window.location.href = '/login'` mà không kích hoạt `signOut()` của NextAuth, khiến cookie session NextAuth vẫn tồn tại gây conflict redirect.
- **Invariants bắt buộc duy trì**:
  - Bảo toàn định dạng JWT payload chuẩn `{ id, email, lastName, firstName }` cho cả Access Token và Refresh Token.
  - Đảm bảo tính tương thích với Refine `dataProvider` và NextAuth session lifecycle.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; không phát sinh Type Contract mới)*

- **AST Seams & Callers**:
  - `only-one-be/src/modules/auth/controllers/auth.controller.ts`: Gỡ bỏ `@Auth()` tại method `refreshToken`.
  - `only-one-be/src/modules/auth/services/auth.service.ts`: Sửa `payload.userId` thành `payload.id || payload.userId` trong method `refreshToken`.
  - `only-one-fe/src/providers/data-provider.ts`: Bổ sung module-level state `isRefreshing` và `failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }>` trong `createSessionAxiosInstance`, tích hợp `getSession()` / refresh flow và retry request.
  - `only-one-fe/src/contexts/RefineContext.tsx`: Cập nhật `authProvider.onError` và `useEffect` session listener để xử lý `RefreshAccessTokenError` và `statusCode === 401`.
  - `only-one-fe/src/services/base.service.ts`: Gọi `signOut({ redirect: true, callbackUrl: '/login' })` khi dính 401.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
only-one-be/src/modules/auth/
├── [MODIFY] controllers/auth.controller.ts  # Gỡ bỏ @Auth() decorator trên endpoint refresh-token
└── [MODIFY] services/auth.service.ts        # Fix payload.id khi lấy user từ refresh token

only-one-fe/src/
├── [MODIFY] providers/data-provider.ts      # Triển khai Silent Refresh queue & retry trong Axios interceptor
├── [MODIFY] contexts/RefineContext.tsx      # Bắt RefreshAccessTokenError và 401 trong authProvider.onError
└── [MODIFY] services/base.service.ts        # Đồng bộ signOut NextAuth khi gặp 401
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `only-one-be/src/modules/auth/controllers/auth.controller.ts` | `AuthController.refreshToken` | `None` | `npx tsc -p tsconfig.build.json --noEmit` (in BE) |
| **2** | `[x]` | `[MODIFY]` | `only-one-be/src/modules/auth/services/auth.service.ts` | `AuthService.refreshToken` | `None` | `npx tsc -p tsconfig.build.json --noEmit` (in BE) |
| **3** | `[x]` | `[MODIFY]` | `only-one-fe/src/providers/data-provider.ts` | `createSessionAxiosInstance` | `Order 1, Order 2` | `npx tsc --noEmit` (in FE) |
| **4** | `[x]` | `[MODIFY]` | `only-one-fe/src/contexts/RefineContext.tsx` | `RefineContext.authProvider`, `useEffect` | `Order 3` | `npx tsc --noEmit` (in FE) |
| **5** | `[x]` | `[MODIFY]` | `only-one-fe/src/services/base.service.ts` | `BaseApi.constructor` response interceptor | `None` | `npx tsc --noEmit` (in FE) |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `only-one-be/src/modules/auth/controllers/auth.controller.ts`
> **Action**: Gỡ bỏ `@Auth()` decorator trên endpoint `refresh-token` để cho phép client gọi khi Access Token đã hết hạn.

```diff
@@ -35,3 +35,2 @@
 
-    @Auth()
     @PostRestApi({
         path: 'refresh-token',
```

---

### 2. `[MODIFY]` `only-one-be/src/modules/auth/services/auth.service.ts`
> **Action**: Sửa `payload.userId` thành `payload.id || payload.userId` để lấy đúng ID người dùng từ JWT payload.

```diff
@@ -62,3 +62,3 @@
 
-        const user = await this.userService.getUserRefreshToken(payload.userId);
+        const user = await this.userService.getUserRefreshToken(payload.id || payload.userId);
 
```

---

### 3. `[MODIFY]` `only-one-fe/src/providers/data-provider.ts`
> **Action**: Triển khai hàng đợi Request Queue (`failedQueue`) và xử lý Silent Refresh với `getSession()` trong response interceptor của `createSessionAxiosInstance`.

```diff
@@ -3,2 +3,3 @@
 import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
+import { getSession, signOut } from 'next-auth/react';
 import { BaseRecord, CreateManyParams, CreateParams, CustomParams, DeleteManyParams, DeleteOneParams, GetListParams, GetManyParams, GetOneParams, HttpError, UpdateManyParams, UpdateParams } from '@refinedev/core';
@@ -75,2 +76,14 @@
 
+let isRefreshing = false;
+let failedQueue: Array<{
+    resolve: (token: string | null) => void;
+    reject: (error: any) => void;
+}> = [];
+
+const processQueue = (error: any, token: string | null = null) => {
+    failedQueue.forEach((prom) => {
+        if (error) {
+            prom.reject(error);
+        } else {
+            prom.resolve(token);
+        }
+    });
+    failedQueue = [];
+};
+
 export const createSessionAxiosInstance = (session: Session | null) => {
@@ -113,23 +126,50 @@
 
-            let isRefreshing = false;
             const originalRequest = error.config;
 
             if (error?.response?.status === 401 && !originalRequest?._retry) {
                 if (originalRequest?.url?.includes('auth/')) {
-                    isRefreshing = false;
                     return Promise.reject(customError);
                 }
 
                 if (isRefreshing) {
-                    return new Promise(function (resolve, reject) {
-                        resolve(null);
+                    return new Promise((resolve, reject) => {
+                        failedQueue.push({ resolve, reject });
                     })
-                        .then(() => {
-                            return axios(originalRequest);
+                        .then((token) => {
+                            if (token && originalRequest.headers) {
+                                originalRequest.headers['Authorization'] = `Bearer ${token}`;
+                            }
+                            return axiosInstance(originalRequest);
                         })
                         .catch((err) => {
                             return Promise.reject(err);
                         });
                 }
+
+                originalRequest._retry = true;
+                isRefreshing = true;
+
+                try {
+                    const newSession = await getSession();
+                    const newAccessToken = newSession?.user?.accessToken;
+
+                    if (newAccessToken && !newSession?.user?.error) {
+                        processQueue(null, newAccessToken);
+                        if (originalRequest.headers) {
+                            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
+                        }
+                        return axiosInstance(originalRequest);
+                    } else {
+                        processQueue(customError, null);
+                        signOut({ redirect: true, callbackUrl: '/login' });
+                        return Promise.reject(customError);
+                    }
+                } catch (refreshErr) {
+                    processQueue(refreshErr, null);
+                    signOut({ redirect: true, callbackUrl: '/login' });
+                    return Promise.reject(customError);
+                } finally {
+                    isRefreshing = false;
+                }
             }
 
             return Promise.reject(customError);
```

---

### 4. `[MODIFY]` `only-one-fe/src/contexts/RefineContext.tsx`
> **Action**: Xử lý `RefreshAccessTokenError` trong `useEffect` và mở rộng điều kiện kiểm tra 401 trong `authProvider.onError`.

```diff
@@ -68,2 +68,14 @@
         }
 
+        if (session?.user?.error === 'RefreshAccessTokenError' && !isAuthPublicPage) {
+            if (typeof window !== 'undefined') {
+                sessionStorage.setItem(KEY_SESSION_STORAGE.RETURN_URL, to);
+            }
+
+            signOut({
+                redirect: true,
+                callbackUrl: '/login',
+            });
+            return;
+        }
+
         setSessionBootstrapComplete(true);
@@ -164,3 +176,3 @@
         onError: async (error) => {
-            if (error.response?.status === 401) {
+            if (error?.statusCode === 401 || error?.status === 401 || error?.response?.status === 401) {
                 return { logout: true };
             }
```

---

### 5. `[MODIFY]` `only-one-fe/src/services/base.service.ts`
> **Action**: Tích hợp `signOut` từ `next-auth/react` khi gặp lỗi 401 trong `BaseApi`.

```diff
@@ -3,2 +3,3 @@
 import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
+import { signOut } from 'next-auth/react';
 import { isEmpty } from 'lodash';
@@ -68,4 +69,4 @@
                         }
 
-                        window.location.href = '/login';
+                        signOut({ redirect: true, callbackUrl: '/login' });
                     }
```

---

## Section 5. Test Cases & Verification

- **Automated Verification**:
  - [x] Backend TypeScript validation: `npx tsc -p tsconfig.build.json --noEmit` (PASS - Exit code 0)
  - [x] Backend ESLint: `$env:ESLINT_USE_FLAT_CONFIG="false"; npx eslint src/modules/auth/controllers/auth.controller.ts src/modules/auth/services/auth.service.ts` (PASS - 0 errors)
  - [x] Frontend TypeScript validation: `npx tsc --noEmit` (PASS - Exit code 0)
  - [x] Frontend ESLint: `npx eslint src/providers/data-provider.ts src/contexts/RefineContext.tsx src/services/base.service.ts` (PASS - 0 errors)
- **Manual Verification Steps**:
  1. Đăng nhập vào hệ thống.
  2. Mở DevTools Network tab.
  3. Khi Access Token hết hạn $\rightarrow$ request nhận mã 401:
     - `createSessionAxiosInstance` tự động kích hoạt `getSession()` để silent refresh token.
     - Các request đồng thời được giữ trong `failedQueue`.
     - Ngay sau khi có Token mới, toàn bộ request trong queue được retry với `Authorization: Bearer <new_token>` và hoàn tất thành công.
  4. Khi `refreshToken` hết hạn hoặc không hợp lệ:
     - NextAuth trả về `RefreshAccessTokenError` hoặc request lỗi $\rightarrow$ `signOut({ redirect: true, callbackUrl: '/login' })` được kích hoạt lập tức, dọn sạch session và đưa người dùng về trang đăng nhập.
