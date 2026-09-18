# Debug: TypeError: getApiUrl is not a function in useUserPreferenceSync

---
status: fixed
slug: 20260918-200327-debug-get-api-url-error
started_at: 2026-09-18 20:03:27
completed_at: 2026-09-18
reproduction_test: "Browser/SSR Error: TypeError: getApiUrl is not a function at useCustomData in RefineContext.tsx:30"
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)

- **Triệu chứng & Stack Trace**:
  ```text
  ⨯ TypeError: getApiUrl is not a function
      at useCustomData (src_hooks_15a_n33._.js:50:187)
      at useUserPreferenceSync (src_hooks_15a_n33._.js:2716:176)
      at App (src\contexts\RefineContext.tsx:30:26)
    28 |
    29 | const App = ({ children, defaultMode }: PropsWithChildren<AppProps>) => {
  > 30 |     useUserPreferenceSync();
       |                          ^
    31 |     const { data: session, status } = useSession();
  ```
- **Red Test Case / Trigger Condition**:
  - Khi load bất kỳ trang nào (ví dụ `GET /login`), component `App` trong `RefineContext.tsx` chạy trong quá trình SSR và client hydration.
  - `App` gọi trực tiếp hook `useUserPreferenceSync()`.
  - Hook này gọi `useCustomData()`, bên trong gọi `useApiUrl()` từ `@refinedev/core`.
  - Do `App` là component chứa `<Refine>` (chưa render vào cây con của `<Refine>`), Context của Refine chưa tồn tại ở cấp độ của `App`, dẫn đến `useApiUrl()` cố gắng truy xuất hàm `getApiUrl` từ Context rỗng $\rightarrow$ `TypeError: getApiUrl is not a function`.

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)

### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  - `@refinedev/core` hooks như `useCustomData`, `useApiUrl`, `useCustom` phụ thuộc vào `DataContext` do provider `<Refine>` khởi tạo.
  - Trong `src/contexts/RefineContext.tsx`, hook `useUserPreferenceSync()` được đặt tại đầu hàm `App` (bên ngoài `<Refine>...</Refine>`).
  - Khi `App` render, context của Refine chưa được mount, khiến `useApiUrl()` thất bại khi truy xuất `dataProvider.getApiUrl`.
- **Invariants bắt buộc bảo toàn**:
  - `useUserPreferenceSync` vẫn tự động đồng bộ theme palette của người dùng khi đã authenticated.
  - Không làm thay đổi cấu trúc Session và AuthProvider của `RefineContext`.

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**:
  - Tạo sub-component nội bộ `UserPreferenceSync` (hoặc đặt hook vào component con) và render bên trong thẻ `<Refine>`:
    ```tsx
    const UserPreferenceSync = () => {
        useUserPreferenceSync();
        return null;
    };
    ```
  - Xóa lệnh gọi trực tiếp `useUserPreferenceSync()` ở component cha `App`, chuyển `<UserPreferenceSync />` vào làm con của `<Refine>`.
- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/contexts/
└── [MODIFY] RefineContext.tsx       # Di chuyển useUserPreferenceSync vào sub-component bên trong <Refine>
```

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/contexts/RefineContext.tsx` | `App`, `UserPreferenceSync` | `None` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `src/contexts/RefineContext.tsx`
- **Mục đích thay đổi (Action / Rationale)**: Chuyển vị trí thực thi `useUserPreferenceSync` vào bên trong cây ngữ cảnh của `<Refine>` để `useCustomData` và `useApiUrl` có đầy đủ context.
- **Điểm can thiệp (AST Seams / Target Symbols)**: Component `App` và thêm helper component `UserPreferenceSync`.
- **Chi tiết thay đổi mã nguồn**:

```diff
@@ -25,10 +25,14 @@
 type AppProps = {
     defaultMode?: string;
 };
 
+const UserPreferenceSync = () => {
+    useUserPreferenceSync();
+    return null;
+};
+
 const App = ({ children, defaultMode }: PropsWithChildren<AppProps>) => {
-    useUserPreferenceSync();
     const { data: session, status } = useSession();
 
     const to = usePathname();
     const router = useRouter();
@@ -242,6 +246,7 @@
                     projectId: 'a2b3c4d5-e6f7g8h9-i10j11k12',
                 }}
             >
+                <UserPreferenceSync />
                 {children}
                 <UnsavedChangesNotifierAppRouter />
             </Refine>
```

## Section 5. Verification & Regression Guard

- **Automated Tests**:
  - `[x]` `npx tsc --noEmit` (PASS - RefineContext và các module liên quan hợp lệ)
- **Manual Checks**:
  - `[x]` Truy cập `/login` và render SSR/client không còn bị crash bởi lỗi `TypeError: getApiUrl is not a function`.
  - `[x]` Hook `useUserPreferenceSync` chạy an toàn bên trong `<Refine>`.
