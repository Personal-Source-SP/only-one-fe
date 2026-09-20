---
id: 20260920-140700-form-field-visible-support
title: Bổ sung Thuộc tính visible cho IBaseFormField và Chuẩn hóa Dynamic Form Schema
archived_at: 2026-09-20
status: active
references:
  - only-one/archives/20260918-211800-polymorphic-form-sections-and-inputs-architecture.md
  - only-one/archives/20260920-135204-refactor-device-approach-modal-to-form-modal-container.md
affected_modules:
  - src/interfaces/forms.ts
  - src/components/common/forms/custom-form-field/index.tsx
  - src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx
---

# Archive: Bổ sung Thuộc tính visible cho IBaseFormField và Chuẩn hóa Dynamic Form Schema

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: `IBaseFormField` trước đây thiếu thuộc tính `visible`, buộc các modal có dynamic field dependent phải dùng toán tử spread mảng ternary `...(condition ? [field] : [])`, gây gãy mạch schema và khó mở rộng.
- **Giá trị (Value)**: Mở rộng `visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);` trên `IBaseFormField` và tích hợp vào `CustomFormField` để tự động trả về `null` (không chiếm cột grid), giúp các form schema được khai báo phẳng, sạch sẽ và hoàn toàn nhất quán với `IBaseFormSection`.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Hướng tiếp cận (Approach)**:
  - Bổ sung `visible` vào `IBaseFormField` trong `src/interfaces/forms.ts`.
  - Trong `CustomFormField`, tính toán `isVisible` và `if (!isVisible) return null;` trước khi bọc thẻ `CustomCol`.
  - Refactor `DeviceApproachModal` loại bỏ hoàn toàn spread ternary, chuyển sang dùng `visible` trực tiếp cho `ports`, `credentials`, `resultCard`.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [`forms.ts`](file:///d:/Sources/Personal/only-one-fe/src/interfaces/forms.ts): Thêm `visible` vào `IBaseFormField`.
- [`custom-form-field/index.tsx`](file:///d:/Sources/Personal/only-one-fe/src/components/common/forms/custom-form-field/index.tsx): Tự động ẩn field khi `isVisible === false`.
- [`DeviceApproachModal.tsx`](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx): Sử dụng thuộc tính `visible` phẳng cho các field động.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (`tsc --noEmit`, ESLint pass).
- **PR URL / Branch**: `main`
