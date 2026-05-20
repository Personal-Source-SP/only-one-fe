## Why

Nhóm route `(public)` là cửa ngõ đăng nhập/đăng ký/khôi phục mật khẩu nhưng UI vẫn lệch design system (ví dụ `AuthCard` dùng `text-slate-600` thay vì token hub), và luồng session (NextAuth + `RefineContext`) dùng chung toàn app nên trạng thái loading/redirect/error trên các trang public dễ không nhất quán hoặc sai (ví dụ khóa `returnUrl` trong `logout` khác với `KEY_SESSION_STORAGE.RETURN_URL`). Cần một đợt chỉnh có spec để đồng bộ shell auth với Minimal Swiss / hub tokens và làm rõ hành vi gate session.

## What Changes

- **UI**: Cập nhật shell `(public)` và module `auth` dùng chung (AuthLayout, AuthCard, form pattern) theo hub tokens và custom layer; responsive và semantic HTML.
- **Luồng session & loading**: Rà soát `RefineContext` (redirect khi đã đăng nhập trên public page, `status === 'loading'`, `isDomLoaded`, hết hạn session), đồng bộ `sessionStorage` với hằng số dự án, dependency/effect để tránh flash hoặc redirect sai; hiển thị lỗi đăng nhập/đăng ký rõ ràng (message an toàn cho user, không nuốt lỗi).
- **Bugfix**: Sửa các lệch hành vi đã xác định (khóa `returnUrl` trong logout vs constant; resource Refine `forgot-password` vs path `/forget-password` nếu gây lệch); audit thêm trong pha apply.

## Capabilities

### New Capabilities

- `public-auth-routes-ui`: Giao diện và composition cho `src/app/(public)/*` và presentation layer auth (card, layout, liên kết) bám hub tokens / Style A, responsive.
- `public-auth-session-gate`: Hành vi bootstrap session trên các trang public và liên quan: loading, redirect authenticated user, lưu `RETURN_URL`, logout, thông báo lỗi nhất quán với Refine/NextAuth.

### Modified Capabilities

- Không có: `openspec/specs/` hiện không có capability baseline để delta.

## Impact

- `src/app/(public)/layout.tsx`, `login/page.tsx`, `register/page.tsx`, `forget-password/page.tsx`
- `src/components/module/auth/*` (AuthLayout, AuthCard, LoginForm, RegisterForm, ForgetPasswordForm, social login, …)
- `src/contexts/RefineContext.tsx` (gate session, authProvider, storage keys)
- Có thể `src/constants/common.constant.ts` (`AUTH_PUBLIC_PAGES`)
- Không **BREAKING** API backend; thay đổi chủ yếu UI và hành vi client auth bootstrap.
