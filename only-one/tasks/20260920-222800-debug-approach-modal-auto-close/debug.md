# Debug: Sửa lỗi DeviceApproachModal tự đóng và thống nhất cơ chế unwrap dữ liệu kết quả thực thi

---
status: fixed
slug: debug-approach-modal-auto-close
started_at: 2026-09-20 22:28:00
completed_at: 2026-09-20 22:31:30
reproduction_test: Manual / Static Code Inspection & Typecheck
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng**:
  1. Khi người dùng nhấn "Bắt Đầu Thực Thi" trong modal chẩn đoán tiếp cận thiết bị (`DeviceApproachModal`), request POST `/network-devices/approach/execute` hoàn thành và báo toast thành công nhưng modal ngay lập tức tự động đóng lại thay vì giữ mở để hiển thị `ApproachResultCard`.
  2. Dữ liệu trả về từ `dataProvider.create` không được unwrap đồng bộ qua `unwrapResponseData` (khác với `getList`, `getOne`, `getMany`), dẫn đến việc callback phải dùng hack ép kiểu nhiều tầng không an toàn.
- **Red Test Case**:
  1. Người dùng mở `DeviceApproachModal` từ trang Network Device Tool.
  2. Bấm "Bắt Đầu Thực Thi" -> mutation thành công -> `useModalForm` kích hoạt `autoSubmitClose = true` (mặc định của Refine), gọi `close()`, khiến modal đóng ngay lập tức.
  3. `dataProvider.create` trả về raw `res.data` (chứa NestJS `ResponseDto` envelope `{ isSuccess, data, errors }`) thay vì unwrap đồng bộ như các phương thức khác của dataProvider.
- **Lệnh kiểm tra / Fast Verification Command**:
  `npx tsc --noEmit` & ESLint tại `only-one-fe`.

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)

### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. **Modal Auto-Close Behavior**: Hook `useCustomModalForm` bên dưới dùng `useModalForm` từ `@refinedev/antd` với `autoSubmitClose = true` theo mặc định. `approachModalForm` trong `useNetworkDeviceModals.ts` chưa cấu hình `autoSubmitClose: false`.
  2. **Data Provider Envelope Consistency**: Trong `src/providers/data-provider.ts`, các phương thức `getList`, `getOne`, `getMany` đều gọi `unwrapResponseData(apiResponseData)` để bóc tách envelope của backend, nhưng `create` và `update` lại trả về `{ data: apiResponseData }` nguyên bản mà không bóc tách qua `unwrapResponseData`. Điều này gây bất nhất dữ liệu trả về giữa các phương thức CRUD.
- **Invariants bị vi phạm**:
  - `dataProvider` của Refine phải luôn trả về dữ liệu nghiệp vụ đã được unwrap nhất quán (`{ data: unwrapped.data }`) cho tất cả các thao tác CRUD (`getList`, `getOne`, `getMany`, `create`, `update`).
  - Modal chẩn đoán tương tác một bước phải giữ nguyên trạng thái mở sau khi hoàn tất lệnh thực thi để người dùng xem kết quả chi tiết.
  - Mã nguồn tuân thủ Type Safety, không sử dụng hack ép kiểu `any` (`((data?.data as any)?.data ?? data?.data)`).

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**:
  1. **Thống nhất Data Provider**: Cập nhật `create` và `update` trong `src/providers/data-provider.ts` sử dụng `unwrapResponseData(apiResponseData)` để bóc tách envelope chuẩn xác và đồng bộ với `getOne` / `getList`.
  2. **Cấu hình Hook Modal Form**: Trong `useNetworkDeviceModals.ts`, cấu hình `autoSubmitClose: false` và định nghĩa generic types chuẩn (`useCustomModalForm<IApproachResultResponse, IExecuteApproachRequest, IApproachResultResponse>`), đồng thời gán dữ liệu trực tiếp và trong sáng qua `onMutationSuccess: (data) => setApproachResult(data?.data ?? null)`.
- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/
├── providers/
│   └── [MODIFY] data-provider.ts           # Bổ sung unwrapResponseData cho create & update để thống nhất dữ liệu
└── app/(root)/tool/network-device/hooks/
    └── [MODIFY] useNetworkDeviceModals.ts  # Thêm autoSubmitClose: false và gán kiểu chuẩn cho approachModalForm
```

## Section 3. Task Matrix & Dependency Graph
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/providers/data-provider.ts` | `create`, `update` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/hooks/useNetworkDeviceModals.ts` | `useNetworkDeviceModals` -> `approachModalForm` | `Order 1` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `src/providers/data-provider.ts`
- **Mục đích thay đổi (Action / Rationale)**: Thống nhất việc unwrap response data trên toàn bộ `dataProvider` (`create`, `update`) bằng `unwrapResponseData`, giúp các hook nhận đúng entity data chuẩn mà không cần bóc tách thủ công hay ép kiểu bất thường.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `create` và `update` trong `RestServer`
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -314,12 +314,14 @@
     create: async ({ resource, variables }) => {
-        const { data } = await httpClient.post(`${apiUrl}/${resource}`, variables);
-        return { data };
+        const { data: apiResponseData } = await httpClient.post(`${apiUrl}/${resource}`, variables);
+        const unwrapped = unwrapResponseData(apiResponseData);
+        return { data: unwrapped.data };
     },

     createMany: async ({ resource, variables }) => {
         const response = await Promise.all(
             variables.map(async (param) => {
                 const { data } = await httpClient.post(`${apiUrl}/${resource}`, param);
                 return data;
             }),
         );

         return { data: response };
     },

     update: async ({ resource, id, variables }) => {
-        const { data } = await httpClient.put(`${apiUrl}/${resource}/${id}`, variables);
-        return { data };
+        const { data: apiResponseData } = await httpClient.put(`${apiUrl}/${resource}/${id}`, variables);
+        const unwrapped = unwrapResponseData(apiResponseData);
+        return { data: unwrapped.data };
     },
```

### 2. `[MODIFY]` `src/app/(root)/tool/network-device/hooks/useNetworkDeviceModals.ts`
- **Mục đích thay đổi (Action / Rationale)**: Thêm `autoSubmitClose: false`, khai báo generic type rõ ràng và gán dữ liệu `setApproachResult(data?.data ?? null)` chuẩn mực không qua ép kiểu hack.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `useNetworkDeviceModals` -> `approachModalForm`
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -36,12 +36,17 @@
-    const approachModalForm = useCustomModalForm<BaseRecord, IExecuteApproachRequest>({
+    const approachModalForm = useCustomModalForm<
+        IApproachResultResponse,
+        IExecuteApproachRequest,
+        IApproachResultResponse
+    >({
         action: 'create',
         resource: API_ENDPOINT.NETWORK_DEVICES.APPROACH_EXECUTE,
         autoResetForm: false,
+        autoSubmitClose: false,
         successNotification: {
             type: 'success',
             message: 'Thực thi chẩn đoán hoàn tất',
         },
         onMutationSuccess: (data) => {
-            setApproachResult(data?.data as unknown as IApproachResultResponse);
+            setApproachResult(data?.data ?? null);
         },
     });
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `[x]` Typecheck (`npx tsc --noEmit`): `PASS (Green)`
  - `[x]` Linter & Prettier: `PASS (0 errors)`
- **Manual Verification**:
  - Mở modal Chẩn đoán & Tiếp cận Thiết bị.
  - Chọn phương thức và nhấn "Bắt Đầu Thực Thi".
  - Xác nhận modal giữ nguyên mở, hiển thị đúng card "Kết quả thực thi" với đầy đủ trường dữ liệu (`isSuccess`, `responseTimeMs`, `matchedCredential`, `data`, `errorMessage`).
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Đồng bộ `unwrapResponseData` tại tầng `dataProvider` giúp toàn bộ ứng dụng sử dụng data đã chuẩn hóa, tránh tình trạng mỗi component phải tự parse/unwrap response payload.
