# Concept: Tái Cấu Trúc & Phân Rã Toàn Diện Các Component Quản Lý Tính Năng (Feature History, Test Sandbox & Config Forms)

## 1. Problem & Goal (Vấn đề & Mục tiêu)
- **Problem**: Sau khi đã module hóa thành công `FeatureSettingModal` và `FeatureCard`, 4 component còn lại trong cụm tính năng (`FeatureHistoryModal`, `FeatureTestTab`, `ScrapingConfigForm`, `SearchConfigForm`) vẫn là các file nguyên khối (300 - 430 LOC/file). Các component này trộn lẫn logic gọi API (mutations, query), form field state, dynamic UI rendering và render viewer, gây khó khăn cho việc bảo trì, tối ưu re-render (`useMemo`, `useCallback`) và tái sử dụng.
- **Goal**:
  1. Phân rã mỗi component thành module thư mục độc lập với các sub-components phân tách ranh giới rõ ràng (< 100 LOC/sub-component).
  2. Tách các custom hooks chuyên trách quản lý state và side-effects (`useFeatureHistoryManager`, `useFeatureTestRunner`, `useScrapingConfigForm`, `useSearchConfigForm`).
  3. Áp dụng chuẩn typing nhất quán (`type` alias cho props), memoize handlers (`useCallback`) và formatters (`useMemo`).
  4. Duy trì 100% khả năng tương thích ngược thông qua barrel export `components/index.ts`.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope (Bắt buộc thực hiện)
- **FeatureHistoryModal**:
  - Tách thành `components/FeatureHistoryModal/`:
    - `index.tsx`: Container modal điều phối.
    - `VersionList.tsx`: Danh sách phiên bản lịch sử (left pane), active badge, change type tags.
    - `VersionDetail.tsx`: Chi tiết phiên bản (right pane), metadata, snapshot diff/JSON viewer, rollback action & copy JSON.
  - Tách hook `hooks/useFeatureHistoryManager.ts` quản lý query danh sách version và mutation rollback.
- **FeatureTestTab**:
  - Tách thành `components/FeatureTestTab/`:
    - `index.tsx`: Container điều phối tab thử nghiệm.
    - `TestInputSection.tsx`: Form nhập liệu test động theo feature type (URL/HTML string hoặc Query) & trigger button.
    - `TestResultSection.tsx`: Hiển thị kết quả test (Alert status, latency, response headers, JSON viewer qua `CodeDisplay`).
  - Tách hook `hooks/useFeatureTestRunner.ts` xử lý stateless test vs contextual test.
- **ScrapingConfigForm**:
  - Tách thành `components/ScrapingConfigForm/`:
    - `index.tsx`: Form orchestrator & submit handler.
    - `ScrapingBasicSection.tsx`: Service selector & change description.
    - `ScrapingSelectorsSection.tsx`: Cấu hình selectors (`mainContentSelector`, `waitForSelector`, `isGetParentElement`).
    - `ScrapingNetworkSection.tsx`: User-Agent, Limit & Retry, Advanced switches (`stealthMode`, `cloudflareBypass`, v.v.).
    - `ScrapingCodeSection.tsx`: Trình soạn thảo JavaScript parser function generator (`CodeDisplay`).
- **SearchConfigForm**:
  - Tách thành `components/SearchConfigForm/`:
    - `index.tsx`: Form orchestrator & submit handler.
    - `SearchBasicSection.tsx`: Service selector & change description.
    - `SearchPatternSection.tsx`: Search URL pattern & query placeholder.
    - `SearchSelectorsSection.tsx`: Cấu hình selectors & max results.
    - `SearchCodeSection.tsx`: Trình soạn thảo JavaScript search function generator (`CodeDisplay`).
- **Shared Form Helpers**:
  - Trích xuất helper `renderFormLabel` hoặc `FormSectionCard` dùng chung cho các config form.
- **Barrel Exports**:
  - Cập nhật `components/index.ts` và `hooks/index.ts` để xuất khẩu sạch sẽ.

### Explicit Out-of-Scope (Chủ đích không làm)
- Không thay đổi schema DTO hoặc API endpoints backend (`data-provider-features/**`).
- Không thay đổi business rules của scraping parser generator hay search generator.
- Không thay đổi hành vi routing của `page.tsx`.

---

## 3. Proposed Solution Options & Trade-offs (Giải pháp Đề xuất & Đánh giá)

| Tiêu chí | **Option 1: Phân rã theo Module Thư Mục & Custom Hooks Riêng (Recommended)** | **Option 2: Chỉ tách Sub-components nội bộ, giữ chung Hooks trong file gốc** | **Option 3: Hợp nhất Scraping & Search thành Dynamic DynamicForm duy nhất** |
| :--- | :--- | :--- | :--- |
| **Cơ chế** | Tạo 4 thư mục riêng (`FeatureHistoryModal/`, `FeatureTestTab/`, `ScrapingConfigForm/`, `SearchConfigForm/`), tách hooks chuyên trách và sub-components theo ranh giới nghiệp vụ. | Giữ nguyên form logic và hooks trong `index.tsx`, chỉ cắt nhỏ JSX thành các sub-components presentational. | Gom `ScrapingConfigForm` và `SearchConfigForm` thành một Dynamic Config Form điều khiển bởi Schema / Registry. |
| **Ưu điểm** | - Tách biệt hoàn toàn Business Logic (Hooks) và UI (Presentational Components).<br>- Tối ưu hóa re-render tối đa.<br>- Đồng bộ 100% với kiến trúc của `FeatureSettingModal` và `FeatureCard`. | - Ít tạo file mới hơn Option 1.<br>- Giữ state trực tiếp trong component cha. | - Tái sử dụng triệt để mã nguồn giữa 2 loại config form. |
| **Nhược điểm** | - Cần tạo một số file sub-components và hooks tương ứng. | - Container `index.tsx` vẫn còn dài (150-200 LOC) do chứa nhiều logic handler. | - Độ phức tạp trừu tượng hóa quá cao (Over-engineering), khó debug khi mỗi feature type có các field validation và default values khác nhau. |
| **Độ phức tạp** | **Vừa phải (Standard Modular)** | **Thấp** | **Cao (High Blast Radius)** |
| **Khuyến nghị** | **Lựa chọn tối ưu (Recommended)** | Không khuyến nghị | Không khuyến nghị |

---

## 4. Proposed Module Architecture & Wireframes

### 4.1 Cấu trúc thư mục mục tiêu
```text
src/app/(root)/scraping/features/[dataProviderId]/
├── components/
│   ├── FeatureCard/               # (Đã hoàn thành)
│   ├── FeatureSettingModal/       # (Đã hoàn thành)
│   ├── FeatureHistoryModal/       # [NEW MODULE]
│   │   ├── index.tsx
│   │   ├── VersionList.tsx
│   │   └── VersionDetail.tsx
│   ├── FeatureTestTab/            # [NEW MODULE]
│   │   ├── index.tsx
│   │   ├── TestInputSection.tsx
│   │   └── TestResultSection.tsx
│   ├── ScrapingConfigForm/        # [NEW MODULE]
│   │   ├── index.tsx
│   │   ├── ScrapingBasicSection.tsx
│   │   ├── ScrapingSelectorsSection.tsx
│   │   ├── ScrapingNetworkSection.tsx
│   │   └── ScrapingCodeSection.tsx
│   ├── SearchConfigForm/          # [NEW MODULE]
│   │   ├── index.tsx
│   │   ├── SearchBasicSection.tsx
│   │   ├── SearchPatternSection.tsx
│   │   ├── SearchSelectorsSection.tsx
│   │   └── SearchCodeSection.tsx
│   └── index.ts                   # Barrel export
└── hooks/
    ├── useDataProviderFeaturesPage.ts
    ├── useFeatureVersionManager.ts
    ├── useFeatureHistoryManager.ts # [NEW HOOK]
    ├── useFeatureTestRunner.ts     # [NEW HOOK]
    └── index.ts                    # Barrel export
```

### 4.2 UI Wireframes & Layout Hierarchy

#### A. FeatureHistoryModal Wireframe
```text
+-----------------------------------------------------------------------------+
| [Icon] Lịch sử cấu hình: Cào dữ liệu (Scraping)        [v] generic      [X] |
| Theo dõi lịch sử chỉnh sửa và khôi phục snapshot cấu hình trước đó          |
+------------------------------------+----------------------------------------+
| DANH SÁCH PHIÊN BẢN (5)            | CHI TIẾT PHIÊN BẢN v3                  |
| +--------------------------------+ | +------------------------------------+ |
| | v3 [Đang dùng] [AI tạo]        | | | [User] Admin  [Clock] 04/09 22:15  | |
| | Cập nhật bộ chọn giá sản phẩm  | | | [AI tạo]      [v3 Active]          | |
| | [User] Admin   04/09 22:15     | | +------------------------------------+ |
| +--------------------------------+ | | Mô tả thay đổi:                      | |
| | v2 [Thủ công]                  | | | Cập nhật bộ chọn giá sản phẩm      | |
| | Thêm user agent tùy chỉnh      | | +------------------------------------+ |
| | [User] John    03/09 18:30     | | Cấu hình JSON:           [Copy JSON] | |
| +--------------------------------+ | | +----------------------------------+ |
| | v1 [Khôi phục]                 | | | | {                                | |
| | Khởi tạo cấu hình ban đầu      | | | |   "maxResults": 10,              | |
| +--------------------------------+ | | |   ...                            | |
|                                    | | | }                                | |
|                                    | | +----------------------------------+ |
|                                    | | [Khôi phục phiên bản này (Rollback)] |
+------------------------------------+----------------------------------------+
|                                                                    [ Đóng ] |
+-----------------------------------------------------------------------------+
```

#### B. FeatureTestTab Wireframe
```text
+-----------------------------------------------------------------------------+
| Mode: [ (•) Stateless (Không lưu) | ( ) Contextual (Theo ID) ]              |
+-----------------------------------------------------------------------------+
| THÔNG TIN ĐẦU VÀO THỬ NGHIỆM                                                |
| URL Thử nghiệm: [ https://example.com/product/123                         ] |
| [x] Thử nghiệm với chuỗi HTML tùy chỉnh                                     |
| [ HTML Content Textarea (Monaco / Input.TextArea)                         ] |
|                                                    [ Nút: Chạy thử nghiệm ] |
+-----------------------------------------------------------------------------+
| KẾT QUẢ THỬ NGHIỆM                                                          |
| [ Alert: Thành công (200 OK) • Thời gian xử lý: 342ms • Số item: 1 ]        |
| Dữ liệu trích xuất (JSON):                                     [Copy JSON] |
| +-------------------------------------------------------------------------+ |
| | {                                                                       | |
| |   "title": "Áo Thun Cotton Nam",                                       | |
| |   "price": 199000,                                                      | |
| |   "sku": "AT-001"                                                       | |
| | }                                                                       | |
| +-------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```

---

## 5. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Form Instance Synchronization**:
   - `ScrapingConfigForm` và `SearchConfigForm` nhận `form?: FormInstance` từ `FeatureSettingModal` (để nút "Lưu cấu hình" ở Modal Footer có thể trigger `form.submit()`).
   - *Mitigation*: Giữ nguyên cơ chế `const [internalForm] = CustomForm.useForm(); const form = externalForm || internalForm;` và đảm bảo các sub-components không tự tạo `Form` wrapper riêng biệt mà kế thừa `Form` context từ container.
2. **Monaco Editor / CodeDisplay Performance**:
   - `CodeDisplay` (Monaco Editor) có thể gây lag nếu re-render liên tục khi user gõ vào các input text khác.
   - *Mitigation*: Cô lập `ScrapingCodeSection` / `SearchCodeSection` và memoize giá trị `functionGenerator` bằng `CustomForm.useWatch` hoặc `memo`.
3. **Rollback Race Condition & Cache Invalidation**:
   - Khi thực hiện rollback một phiên bản cũ trong `FeatureHistoryModal`, danh sách version và dữ liệu của feature trên parent page cần được đồng bộ lại.
   - *Mitigation*: Gọi `query.refetch()` kết hợp `onSuccess()` callback sau khi rollback thành công.

---

## 6. Definition of Done (Tiêu chuẩn Hoàn thành)
- Toàn bộ 4 component (`FeatureHistoryModal`, `FeatureTestTab`, `ScrapingConfigForm`, `SearchConfigForm`) được tổ chức thành các thư mục module riêng.
- File container chính `< 100 LOC`, sub-components `< 100 LOC`.
- Tất cả các hàm click/change handlers được bọc trong `useCallback`.
- Tất cả các phép tính biến đổi, lọc dữ liệu được bọc trong `useMemo`.
- Không sử dụng `interface` cho props; 100% dùng `type`.
- Chạy `npx tsc --noEmit` đạt 0 lỗi.
- Chạy `eslint` đạt 0 lỗi.
