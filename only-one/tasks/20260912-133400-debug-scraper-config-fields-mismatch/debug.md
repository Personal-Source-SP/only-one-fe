# Debug: Cấu hình SEARCH_FORM_SECTIONS và SCRAPING_FORM_SECTIONS chưa khớp với target-config.types.ts

---
status: fixed
slug: scraper-config-fields-mismatch
started_at: 2026-09-12 13:34:00
completed_at: 2026-09-12 13:41:00
reproduction_test: npx tsc --noEmit
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Hành vi sai lệch**:
  - Đối soát giữa `target-config.types.ts`, Backend DTO/Helpers (`extract-search-data.helper.ts`, `generic-data-provider-search.service.ts`) và `SEARCH_FORM_SECTIONS` trong `search-config.constants.ts` cho thấy tính năng `SEARCH` (tìm kiếm) bị thiếu hoàn toàn trường `mainContentSelector` trong form cấu hình và `DEFAULT_SEARCH_TARGET_CONFIG`.
  - Mặc dù `ISearchTargetConfig` kế thừa `ITargetConfig` (có chứa `mainContentSelector`), và Backend Search chủ động bóc tách `const { functionGenerator, resultSelector, maxResults, mainContentSelector, isGetParentElement } = targetConfig;` nhưng giao diện Frontend không có trường nhập `mainContentSelector` cho tính năng Search (`ScraperServiceEnum.GENERIC`).
  - Ngoài ra, `userAgent` trong `SEARCH_FORM_SECTIONS` đang có `gridSpan: { xs: 24, md: 24 }` thay vì `md: 12` để đi đôi với các trường selector khác (khi có đủ 4 trường `resultSelector`, `mainContentSelector`, `waitForSelector`, `userAgent` sẽ tạo thành 2 hàng đối xứng 12-12).
- **Red Test Case**:
  - Kiểm tra đối soát thuộc tính form schema:
    ```typescript
    // Kiểm tra trường mainContentSelector trong SEARCH_FORM_SECTIONS:
    const searchSelectorsSection = SEARCH_FORM_SECTIONS.find(s => s.id === 'selectors_params');
    const hasMainContentSelector = searchSelectorsSection?.fields.some(f => f.name === 'mainContentSelector');
    // Trước khi sửa: false (FAIL / RED)
    // Sau khi sửa: true (PASS / GREEN)
    ```
- **Lệnh chạy tái hiện**: `npx tsc --noEmit`

## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. `ISearchTargetConfig` kế thừa toàn bộ `ITargetConfig` (gồm `ITargetConfigSelectors` có `mainContentSelector`, `waitForSelector`, `isGetParentElement`, `queryParams`, `firstQueryParams`).
  2. Ở phía Backend (`only-one-be`), `GenericDataProviderSearchService` và `extract-search-data.helper.ts` hỗ trợ đầy đủ `mainContentSelector` để lọc vùng HTML chứa danh sách sản phẩm trước khi quét `resultSelector`.
  3. Tuy nhiên, khi định nghĩa `SEARCH_FORM_SECTIONS` trong `search-config.constants.ts`, trường `mainContentSelector` đã bị bỏ sót trong mảng `fields` của section `selectors_params`.
  4. Hệ quả là `getDefaultFormValuesFromSections(SEARCH_FORM_SECTIONS, ...)` không sinh ra giá trị mặc định cho `mainContentSelector` trong `DEFAULT_SEARCH_TARGET_CONFIG`, và người dùng không thể cấu hình trường này trên UI khi tạo/sửa Search Feature.
- **Bằng chứng & Dữ liệu thực nghiệm (Evidence)**:
  - `only-one-be/src/modules/data-provider/services/data-provider-search/generic-data-provider-search.service.ts`:
    ```typescript
    const { functionGenerator, resultSelector, maxResults, mainContentSelector, isGetParentElement } = targetConfig;
    ```
  - `only-one-be/src/modules/data-provider/helpers/extract-search-data.helper.ts`:
    ```typescript
    const { functionGenerator, htmlContent, resultSelector, maxResults, mainContentSelector, isGetParentElement } = dto;
    ```
  - `only-one-fe/src/app/(root)/scraping/features/constants/search-config.constants.ts`: `selectors_params` chỉ có `resultSelector`, `waitForSelector`, `userAgent`, `queryParams`, `firstQueryParams` (thiếu `mainContentSelector`).
- **Invariants bị vi phạm**:
  - Tính nhất quán giữa Type Contract (`target-config.types.ts`), Backend execution schema và UI Form Section Definition (`SEARCH_FORM_SECTIONS`).
- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**:
  1. Bổ sung trường `mainContentSelector` vào section `selectors_params` của `SEARCH_FORM_SECTIONS` trong `search-config.constants.ts` với `visibleWhen: [ScraperServiceEnum.GENERIC]` và `gridSpan: { xs: 24, md: 12 }`.
  2. Điều chỉnh `userAgent` trong `SEARCH_FORM_SECTIONS` thành `gridSpan: { xs: 24, md: 12 }` để layout 4 trường bộ chọn của Generic Scraper (`resultSelector`, `mainContentSelector`, `waitForSelector`, `userAgent`) được căn chỉnh cân đối 2 hàng x 2 cột.
  3. Kiểm tra lại toàn bộ danh sách 23 trường trong `ITargetConfig` & `ISearchTargetConfig` để đảm bảo không còn trường nào bị lệch hoặc thiếu sót.

---

## Section 3. Directory Structure & Task Matrix
### 3.1 Directory Structure Changes
```text
src/app/(root)/scraping/features/constants/
└── [MODIFY] search-config.constants.ts  # Bổ sung mainContentSelector và căn chỉnh gridSpan
```

### 3.2 Task Matrix
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/constants/search-config.constants.ts` | `SEARCH_FORM_SECTIONS` | `None` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)
### 1. `[MODIFY]` `src/app/(root)/scraping/features/constants/search-config.constants.ts`
> **Action**: Bổ sung `mainContentSelector` vào `selectors_params` và chuẩn hóa `userAgent` gridSpan.
```diff
--- a/src/app/(root)/scraping/features/constants/search-config.constants.ts
+++ b/src/app/(root)/scraping/features/constants/search-config.constants.ts
@@ -63,6 +63,15 @@ export const SEARCH_FORM_SECTIONS: FormSectionSchema[] = [
                 ],
             },
+            {
+                name: 'mainContentSelector',
+                label: 'Selector nội dung chính',
+                type: 'text',
+                defaultValue: '',
+                placeholder: 'Ví dụ: #search-results, .product-list',
+                gridSpan: { xs: 24, md: 12 },
+                visibleWhen: [ScraperServiceEnum.GENERIC],
+                getRules: () => [
+                    { required: true, message: 'Vui lòng nhập selector nội dung chính' },
+                ],
+            },
             {
                 name: 'waitForSelector',
                 label: 'Selector chờ (Wait for selector)',
@@ -76,7 +76,7 @@ export const SEARCH_FORM_SECTIONS: FormSectionSchema[] = [
                 type: 'text',
                 defaultValue: '',
                 placeholder: 'Mozilla/5.0...',
-                gridSpan: { xs: 24, md: 24 },
+                gridSpan: { xs: 24, md: 12 },
                 visibleWhen: [ScraperServiceEnum.GENERIC],
             },
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `npx tsc --noEmit`: `PASS (Green)`
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Khi một schema kế thừa schema cha (`ISearchTargetConfig extends ITargetConfig`), luôn rà soát chéo giữa `target-config.types.ts`, backend executor và UI Form Sections tương ứng để đảm bảo mọi trường thuộc tính đều có thể cấu hình được trên giao diện.
