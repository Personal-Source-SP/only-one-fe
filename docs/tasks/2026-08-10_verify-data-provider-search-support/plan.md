# Kế hoạch Đảm bảo `DataProviderSettingModal` Hỗ trợ Chính xác `DataProviderSearchService` (Backend)

Kế hoạch này phân tích sự tương thích giữa giao diện Frontend [DataProviderSettingModal](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/index.tsx) và dịch vụ Backend NestJS [DataProviderSearchService](file:///d:/Sources/Personal/only-one-be/src/modules/data-provider/services/data-provider-search.service.ts), đồng thời đề xuất giải pháp điều chỉnh Frontend để khớp 100% với API contracts của Backend.

---

## Section 1. Current state (Trạng thái hiện tại)

### Flow thực thi hiện tại
- Trên Frontend, khi người dùng mở **"Cấu hình hàm tìm kiếm"** (`configType === 'search'`) và tương tác trên [DataProviderSettingModal](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/index.tsx):
  1. Khi bấm **"Chạy thử nghiệm"**: Custom hook [useDataProviderSettingModal](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/hooks.ts#L100-L240) thực hiện gọi API qua `handleTestParser`.
  2. Khi bấm **"Lưu cấu hình"**: Custom hook thực hiện gọi API qua `handleSaveConfig`.

### Các file và symbol liên quan
- **Frontend**:
  - [DataProviderSettingModal/index.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/index.tsx) & [SearchConfigTab.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/SearchConfigTab.tsx).
  - [useDataProviderSettingModal (hooks.ts)](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/hooks.ts#L100-L240).
  - [data-providers/types.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/types.ts).
- **Backend**:
  - [data-provider-search.service.ts](file:///d:/Sources/Personal/only-one-be/src/modules/data-provider/services/data-provider-search.service.ts).
  - [data-provider-search.controller.ts](file:///d:/Sources/Personal/only-one-be/src/modules/data-provider/controllers/data-provider-search.controller.ts).
  - [search-products-request.dto.ts](file:///d:/Sources/Personal/only-one-be/src/modules/data-provider/dtos/requests/search-products-request.dto.ts).
  - [search-config.interface.ts](file:///d:/Sources/Personal/only-one-be/src/modules/data-provider/interfaces/search-config.interface.ts).

### Các vấn đề lệch khớp (Contract Mismatches) được phát hiện:

1. **Sai Endpoint khi Thử nghiệm Tìm kiếm (Test Search)**:
   - **Frontend hiện tại**: Đang gọi `parsers/test-search-function`.
   - **Backend thực tế**: Controller [DataProviderSearchController](file:///d:/Sources/Personal/only-one-be/src/modules/data-provider/controllers/data-provider-search.controller.ts#L11-L39) khai báo `@Controller('data-providers')` và `@Post('test-search-function')`. Đường dẫn chính xác là **`data-providers/test-search-function`**.

2. **Sai Payload Structure khi Thử nghiệm Tìm kiếm**:
   - **Frontend hiện tại**: Gửi object bị phẳng:
     ```json
     {
       "searchUrlPattern": "...",
       "queryPlaceholder": "{query}",
       "mainContentSelector": "...",
       "resultSelector": "...",
       "maxResults": 10,
       "url": "https://shopee.vn/search?keyword=ao-thun"
     }
     ```
   - **Backend DTO [TestSearchFunctionRequestDto](file:///d:/Sources/Personal/only-one-be/src/modules/data-provider/dtos/requests/search-products-request.dto.ts#L23-L43)** yêu cầu:
     ```json
     {
       "searchService": "generic",
       "baseUrl": "https://shopee.vn",
       "searchQuery": "ao-thun",
       "searchConfig": {
         "searchUrlPattern": "https://shopee.vn/search?keyword={query}",
         "queryPlaceholder": "{query}",
         "mainContentSelector": "...",
         "resultSelector": "...",
         "maxResults": 10,
         "isGetParentElement": false,
         "functionGenerator": "..."
       }
     }
     ```

3. **Sai Payload Structure khi Lưu Cấu hình Tìm kiếm (Update Search Config)**:
   - **Frontend hiện tại**: Gửi `values.searchConfig` trực tiếp ở root body `PUT data-providers/:id/search-config`.
   - **Backend DTO [UpdateSearchConfigRequestDto](file:///d:/Sources/Personal/only-one-be/src/modules/data-provider/dtos/requests/search-products-request.dto.ts#L45-L55)** yêu cầu:
     ```json
     {
       "searchConfig": { ... },
       "enableSearch": true
     }
     ```
     Backend sẽ nhận `request.searchConfig` bị `undefined` nếu Frontend không bọc dữ liệu trong field `searchConfig`.

---

## Section 2. Design (Phương án thực hiện)

### Phương án 1: Cập nhật Frontend Hook & Forms để tương thích 100% với Backend DTO (Đề xuất)
- **Cách hoạt động**:
  1. Trong [useDataProviderSettingModal](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/hooks.ts#L100-L240):
     - Sửa endpoint test search từ `'parsers/test-search-function'` thành `'data-providers/test-search-function'`.
     - Đóng gói DTO test search đúng chuẩn `TestSearchFunctionRequestDto`:
       ```ts
       payload = {
           searchService: record?.searchService || record?.scraperService || 'generic',
           baseUrl: record?.baseUrl || '',
           searchQuery: values.testUrl || 'ao-thun',
           searchConfig: values.searchConfig,
       };
       ```
     - Đóng gói DTO update search config đúng chuẩn `UpdateSearchConfigRequestDto`:
       ```ts
       payload = {
           searchConfig: values.searchConfig,
           enableSearch: values.enableSearch ?? true,
       };
       ```
  2. Trong `SearchConfigTab.tsx` & `types.ts`: Bổ sung tùy chọn Switch **`enableSearch`** (Kích hoạt tính năng tìm kiếm) để người dùng chủ động bật/tắt trạng thái tìm kiếm của nhà cung cấp.

- **Ưu điểm**:
  - Khớp 100% với API NestJS và Swagger Contract hiện có của Backend.
  - Không cần sửa đổi Backend code, giữ vững tính ổn định của hệ thống.
  - Bổ sung thêm tính năng bật/tắt `enableSearch` giúp trải nghiệm UI hoàn thiện hơn.

- **Nhược điểm**: Phải điều chỉnh lại hàm đóng gói payload trong `useDataProviderSettingModal`.

### Phương án 2: Sửa Backend DTO để nhận payload phẳng từ Frontend
- **Lý do không chọn**: Vi phạm quy chuẩn thiết kế DTO của Backend NestJS, gây xung đột với validation pipe (`class-validator`) và Swagger documentation đã đóng gói.

> [!TIP]
> **Khuyến nghị**: Lựa chọn **Phương án 1** để đảm bảo tính chuẩn hóa của API giữa Frontend và Backend.

---

## Section 3. Implementation architecture (Kiến trúc triển khai)

### Các file cần điều chỉnh

```text
src/app/(root)/scraping/data-providers/
├── hooks.ts                         [MODIFY] (Sửa endpoint & payload đóng gói cho search test/update)
├── types.ts                         [MODIFY] (Bổ sung enableSearch vào form values/props nếu cần)
└── components/
    └── DataProviderSettingModal/
        └── SearchConfigTab.tsx      [MODIFY] (Thêm switch enableSearch)
```

### ASCII UI Wireframe (`SearchConfigTab` bổ sung `enableSearch`)

```text
+-----------------------------------------------------------------------+
|  [Icon] Mẫu URL Tìm kiếm & Selectors                                  |
|  - URL Mẫu: https://shopee.vn/search?keyword={query}                 |
|  - Query Placeholder: {query}                                         |
|  - Selector chính: .shopee-search-item-result                         |
|  - Selector từng item: .shopee-search-item-result__item               |
+-----------------------------------------------------------------------+
|  [Icon] Giới hạn kết quả & Tùy chọn                                  |
|  - Max Results: [ 10 ]     - [x] Lấy phần tử cha                     |
|  - [x] Bật trạng thái tìm kiếm (enableSearch)                          |  <-- NEW SWITCH
+-----------------------------------------------------------------------+
|  [Icon] Mã nguồn Hàm Tìm kiếm (functionGenerator)                     |
|  [ CodeDisplay Editor ]                                               |
+-----------------------------------------------------------------------+
```

---

## Section 4. Implementation code examples (Ví dụ mã nguồn triển khai)

#### [MODIFY] `src/app/(root)/scraping/data-providers/hooks.ts`

**Overview:** Cập nhật endpoint và cấu trúc payload cho `handleTestParser` và `handleSaveConfig` khi `configType === 'search'`.

```ts
// 1. Cập nhật handleTestParser cho search
const endpoint = isSearch
    ? 'data-providers/test-search-function' // Fix URL endpoint
    : 'parsers/test-parser-function';

const payload = isSearch
    ? {
          searchService: record?.searchService || record?.scraperService || 'generic',
          baseUrl: record?.baseUrl || '',
          searchQuery: values.testUrl || 'ao-thun',
          searchConfig: values.searchConfig,
      }
    : {
          ...values.targetConfig,
          url: values.testUrl,
          htmlContentString: isTestHtmlContent ? values.htmlContentString : undefined,
          scraperService: values.scraperService,
      };

// 2. Cập nhật handleSaveConfig cho search
const payload = isSearch
    ? {
          searchConfig: values.searchConfig,
          enableSearch: values.enableSearch ?? true,
      }
    : {
          ...values.targetConfig,
          scraperService: values.scraperService,
      };
```

---

#### [MODIFY] `src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/SearchConfigTab.tsx`

**Overview:** Bổ sung ô Switch `enableSearch` cho cấu hình tìm kiếm.

```tsx
<CustomCol xs={24} sm={12}>
    <div className="flex items-center justify-between p-3 rounded-lg bg-hub-card border border-hub-border/50">
        <span className="text-sm text-hub-title font-medium">
            Kích hoạt tính năng tìm kiếm (enableSearch)
        </span>
        <CustomForm.Item
            name="enableSearch"
            valuePropName="checked"
            initialValue={true}
            noStyle
        >
            <CustomSwitch />
        </CustomForm.Item>
    </div>
</CustomCol>
```

---

## Section 5. Test cases (Kịch bản kiểm thử)

### Automated Verification
```bash
cmd /c npx tsc --noEmit
```

### Manual Verification
1. **Thử nghiệm Hàm Tìm kiếm (Test Search Function)**:
   - Vào danh sách Data Provider -> Bấm icon kính lúp (Search Config).
   - Nhập Keyword mẫu (ví dụ: `ao-thun`) -> Bấm **"Chạy thử nghiệm"**.
   - Kiểm tra DevTools Network tab: Xác nhận request gửi đến `POST /v1/data-providers/test-search-function` với payload `{ searchService, baseUrl, searchQuery, searchConfig }`.
2. **Lưu Cấu hình Tìm kiếm (Save Search Config)**:
   - Thay đổi selector hoặc `searchUrlPattern` -> Bấm **"Lưu cấu hình"**.
   - Kiểm tra DevTools Network tab: Xác nhận request gửi đến `PUT /v1/data-providers/:id/search-config` với payload `{ searchConfig: { ... }, enableSearch: true }`.
