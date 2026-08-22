# Walkthrough: Standardized Breadcrumb Navigation & actions / filters in ListWrapper

## 1. Summary of Changes

We standardized [`DataProviderFeaturesPage`](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/page.tsx) to utilize `ListWrapper`'s `actions` and `filters` props:

### Key Highlights:
1. **`actions` prop (`CardAction[]`)**:
   - The "Thêm cài đặt" setting dropdown is defined as a `CardAction` and passed to `<ListWrapper actions={actions} ...>`.
   - Automatically supports mobile dropdown view and permission checks.

2. **`filters` prop**:
   - The section title ("Các tính năng hoạt động" + subtitle) is passed via `filters={sectionTitle}`, aligning cleanly with the header layout in `ListWrapper`.

3. **`breadcrumb` prop (`BreadcrumbItem[]`)**:
   - `breadcrumbs` array passed to `breadcrumb={breadcrumbs}`.

4. **Code Quality**:
   - 100% Ant Design primitives (`CustomSpace`, `CustomFlex`, `CustomTypography`, `CustomButton`, `CustomDropdown`).

---

## 2. Verification Results

- **TypeScript Typecheck (`npx tsc --noEmit`)**: 0 errors ✓
- **ESLint & Prettier**: 0 errors, 0 warnings ✓
