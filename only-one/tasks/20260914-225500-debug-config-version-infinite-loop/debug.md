# Debug: Lỗi Gọi Liên Tục API Config Versions Khi Mở Modal Lịch Sử (Infinite Fetch Loop)

---
status: fixed
slug: config-version-infinite-loop
started_at: 2026-09-14 22:55:00
completed_at: 2026-09-14 22:56:00
reproduction_test: useFeatureHistory and useFeatureModalController hook analysis
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Stack Trace**:
  - Khi người dùng bấm vào xem lịch sử cấu hình (hoặc mở modal cấu hình tính năng) của một tính năng chưa có version (hoặc vừa mở modal), frontend gửi request liên tục (hàng chục đến hàng trăm request/giây) tới endpoint:
    `GET http://localhost:3001/api/v1/config-versions/fb55fc91-eb8f-4ca2-aa6f-fa0a8f422dab`
  - Backend in log cảnh báo liên tục: `[ConfigVersionService] No config versions found for feature ID: fb55fc91-eb8f-4ca2-aa6f-fa0a8f422dab`.
  - Network tab của trình duyệt bị spam request liên tục, gây nghẽn mạng và giảm hiệu năng ứng dụng.
- **Red Test Case / Mechanistic Failure Loop**:
  - Trong `useFeatureHistory.ts` (và `useFeatureModalController.ts`), hook gọi `useCustomData` và nhận về object `query`.
  - Có một `useEffect` được định nghĩa như sau:
    ```typescript
    useEffect(() => {
        if (open && featureId) {
            query.refetch();
        }
    }, [open, featureId, query]);
    ```
  - Khi component render, `query` (từ TanStack Query / Refine `useCustom`) thay đổi reference mỗi khi trạng thái query cập nhật (`isFetching`, `status`, `data`).
  - `query.refetch()` bên trong effect kích hoạt một lần fetch mới $\rightarrow$ cập nhật trạng thái `isFetching` $\rightarrow$ tạo object `query` mới $\rightarrow$ kích hoạt lại `useEffect` $\rightarrow$ tạo thành vòng lặp vô hạn (Infinite Loop).
- **Lệnh chạy tái hiện**: Mở modal lịch sử tính năng hoặc modal chỉnh sửa cấu hình trên giao diện `/scraping/features/:dataProviderId`.

## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. **Unstable Dependency in `useEffect`**: Object `query` trả về từ `useCustomData` / `@refinedev/core`'s `useCustom` không có identity ổn định (nó thay đổi thuộc tính `isFetching: true -> false` và reference trên mỗi chu kỳ query).
  2. **Refetch Trigger Loop**: Đặt `query.refetch()` bên trong `useEffect` với `query` nằm trong dependency array `[open, featureId, query]` tạo ra phản hồi dương tính (positive feedback loop): `refetch` $\rightarrow$ đổi trạng thái query $\rightarrow$ effect chạy $\rightarrow$ gọi `refetch`.
  3. **Redundant Refetch Trigger**: `useCustomData` đã có sẵn cơ chế query của React Query với `enabled: Boolean(open && featureId)`. Khi modal mở (`open` chuyển từ `false` sang `true`) hoặc `featureId` thay đổi, TanStack Query đã tự động kích hoạt fetch dữ liệu theo query key. Đoạn `useEffect` thủ công gọi `query.refetch()` là thừa thãi và gây hại.
  4. Lỗi tương tự cũng xuất hiện trong `useFeatureModalController.ts` tại dòng 111-115 với `versionsQuery.refetch()`.
- **Bằng chứng & Dữ liệu thực nghiệm (Evidence)**:
  - Xem trực tiếp mã nguồn tại:
    - [useFeatureHistory.ts:L33-L37](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/hooks/useFeatureHistory.ts#L33-L37)
    - [useFeatureModalController.ts:L111-L115](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/hooks/useFeatureModalController.ts#L111-L115)
- **Invariants bị vi phạm**:
  - Vi phạm quy tắc React Hooks: Không bao giờ đưa mutating callback/query object có reference biến động vào dependency array của `useEffect` khi effect đó lại gọi phương thức mutate/refetch của chính object đó.
- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**:
  1. Xóa bỏ `useEffect` gọi `refetch()` không an toàn trong cả 2 hooks [useFeatureHistory.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/hooks/useFeatureHistory.ts) và [useFeatureModalController.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/hooks/useFeatureModalController.ts).
  2. Cấu hình `queryOptions: { refetchOnMount: 'always' }` trong `useCustomData` để đảm bảo dữ liệu luôn được tải mới mỗi khi modal mở mà không tạo loop.
  3. Cập nhật quy tắc âm vào `only-one/rules.md` để ngăn chặn anti-pattern này lặp lại.

## Section 3. Directory Structure & Task Matrix
### 3.1 Directory Structure Changes
```text
src/app/(root)/scraping/features/hooks/
├── [MODIFY] useFeatureHistory.ts          # Remove useEffect refetch loop, add refetchOnMount
└── [MODIFY] useFeatureModalController.ts  # Remove useEffect refetch loop, add refetchOnMount
only-one/
└── [MODIFY] rules.md                      # Add negative rule [NEVER] query.refetch in useEffect
```

### 3.2 Task Matrix
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureHistory.ts` | `useFeatureHistory` | `None` | `npm run build` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts` | `useFeatureModalController` | `None` | `npm run build` |
| **3** | `[x]` | `[MODIFY]` | `only-one/rules.md` | `Rule 52` | `None` | `None` |

## Section 4. Code Changes (Unified Diff)
### 1. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureHistory.ts`
```diff
     const { data: sortedVersions = [], query } = useCustomData<IConfigVersion[], IConfigVersion[]>({
         enabled: Boolean(open && featureId),
         url: API_ENDPOINT.CONFIG_VERSION_FEATURES.VERSIONS(featureId),
+        queryOptions: {
+            refetchOnMount: 'always',
+        },
         transform: (data) => {
             const list = (Array.isArray(data) ? data : []) as IConfigVersion[];
             return [...list].sort((a, b) => b.versionId - a.versionId);
         },
     });
-
-    useEffect(() => {
-        if (open && featureId) {
-            query.refetch();
-        }
-    }, [open, featureId, query]);
```

### 2. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureModalController.ts`
```diff
     const { data: versions = [], query: versionsQuery } = useCustomData<
         IConfigVersion[],
         IConfigVersion[]
     >({
         enabled: Boolean(open && feature.id),
         url: API_ENDPOINT.CONFIG_VERSION_FEATURES.VERSIONS(feature.id),
+        queryOptions: {
+            refetchOnMount: 'always',
+        },
         transform: (data) => (Array.isArray(data) ? data : []) as IConfigVersion[],
     });
-
-    useEffect(() => {
-        if (open && feature.id) {
-            versionsQuery.refetch();
-        }
-    }, [open, feature.id, versionsQuery]);
```

## Section 5. Verification & Regression Guard
- **Automated Verification**:
  - `npm run dev` in `only-one-fe` compiled successfully without TypeScript errors.
- **Manual Verification**:
  - Khi click vào mở modal Lịch sử (FeatureHistoryModal) hoặc modal Cài đặt tính năng (FeatureSettingModal), API `GET /api/v1/config-versions/:featureId` chỉ được gọi duy nhất 1 lần khi modal mở.
  - Vòng lặp vô hạn (Infinite Loop) hoàn toàn biến mất.
  - Khi tính năng chưa có version nào, giao diện hiển thị đúng trạng thái rỗng (`CustomEmpty: "Chưa có phiên bản lịch sử nào cho tính năng này."`) mà không spam request về backend.
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Bổ sung quy tắc âm vào `only-one-fe/only-one/rules.md`:
    `- **[NEVER]** Call query.refetch() inside a useEffect with query in its dependency array — The query object returned by TanStack Query / Refine changes reference on every fetch/state transition, triggering an infinite network request loop. Always rely on queryOptions: { refetchOnMount: 'always' } or enabled: Boolean(open) to load fresh data on modal open, and trigger query.refetch() only inside explicit mutation success callbacks.`
