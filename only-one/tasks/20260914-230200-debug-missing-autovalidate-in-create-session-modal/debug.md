# Debug: Bổ sung trường autoValidate trong CreateSessionModal

---
status: fixed
slug: missing-autovalidate-in-create-session-modal
started_at: 2026-09-14 23:02:00
completed_at: 2026-09-14 23:03:00
reproduction_test: Inspection of CreateSessionModal.tsx vs CreateDiscoverySessionRequestDto
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Đối chiếu Schema**:
  - DTO backend [CreateDiscoverySessionRequestDto](file:///d:/Sources/PERSONAL/only-one-be/src/modules/data-provider/dtos/requests/create-discovery-session-request.dto.ts#L28-L30) và Interface frontend [CreateSessionFormValues](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/types/discovery-session.types.ts#L30-L36) đã định nghĩa thuộc tính:
    `autoValidate?: boolean` (mặc định `true` - tự động kích hoạt tiến trình kiểm tra/xác thực URL ngay sau khi session khám phá hoàn tất).
  - Tuy nhiên trong [CreateSessionModal.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx), `createInitialValues` và Form UI chưa có trường `autoValidate`, khiến người dùng không thể cấu hình bật/tắt hành vi tự động xác thực URL khi tạo phiên khám phá mới.

## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  - Form UI trong `CreateSessionModal.tsx` bị thiếu `<CustomForm.Item name="autoValidate" valuePropName="checked">` và giá trị khởi tạo `autoValidate: true` trong `createInitialValues`.
- **Invariants bị vi phạm**:
  - Vi phạm tính đồng bộ giữa DTO request và Form UI modal.
- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**:
  1. Thêm `autoValidate: true` vào `createInitialValues` của `<CustomModalForm>`.
  2. Bổ sung `<CustomForm.Item name="autoValidate" valuePropName="checked">` kèm switch toggle (`<CustomSwitch />`) với mô tả rõ ràng: *"Tự động xác thực URL sau khi hoàn tất khám phá"*.

## Section 3. Directory Structure & Task Matrix
### 3.1 Directory Structure Changes
```text
src/app/(root)/scraping/discovery/components/
└── [MODIFY] CreateSessionModal.tsx  # Add autoValidate form item and initial value
```

### 3.2 Task Matrix
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx` | `CreateSessionModal` | `None` | Visual Check |

## Section 4. Code Changes (Unified Diff)
### 1. `[MODIFY]` `src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx`
```diff
             createInitialValues={{
                 depth: 1,
                 dataProviderId: '',
                 targetKeywords: [],
                 maxUrls: undefined,
+                autoValidate: true,
             }}
...
+            <CustomForm.Item
+                name="autoValidate"
+                valuePropName="checked"
+                label="Tự động xác thực URL (Auto Validate)"
+            >
+                <CustomFlex align="center" gap="middle">
+                    <CustomSwitch />
+                    <CustomTypography.Text type="secondary" className="text-xs">
+                        Tự động kích hoạt hàng đợi xác thực các URL khám phá được ngay khi hoàn tất
+                    </CustomTypography.Text>
+                </CustomFlex>
+            </CustomForm.Item>
```

## Section 5. Verification & Regression Guard
- **Visual Verification**:
  - Modal khởi tạo phiên khám phá hiển thị đầy đủ trường switch `autoValidate` (mặc định bật `true`).
  - Khi submit, payload `autoValidate` được gửi chính xác lên backend theo đúng hợp đồng DTO `CreateDiscoverySessionRequestDto`.
