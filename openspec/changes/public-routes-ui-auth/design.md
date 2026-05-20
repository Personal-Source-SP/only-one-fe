## Context

Route group `src/app/(public)/` chỉ bọc `MainProvider` + `AuthLayout`; nội dung thực tế nằm ở `@/components/module/auth` (AuthCard, forms, social). Trạng thái đăng nhập toàn cục do NextAuth (`SessionProvider`, `useSession`) và `RefineContext` xử lý redirect, trong khi `MainContext.handleLoading` có thể che toàn bộ UI khi `loading === true` — cần phối hợp để không chồng lấn hoặc flash. Đã phát hiện lệch khóa `sessionStorage` trong `authProvider.logout` so với phần còn lại của codebase.

## Goals / Non-Goals

**Goals:**

- Đồng bộ UI public auth với hub tokens và custom layer đã chốt (Minimal Swiss / change `minimal-swiss-ui-system`).
- Làm rõ và ổn định gate session: loading, redirect authenticated khỏi public pages, return URL, sign-out khi hết hạn.
- Sửa bug xác định (khóa `returnUrl`, dependency/effect gây state sai) và rà soát thêm trong lúc implement.

**Non-Goals:**

- Đổi contract API backend hoặc flow OAuth provider mới.
- Refactor toàn bộ Refine resources hoặc access control ngoài phạm vi auth bootstrap.
- Dark mode đầy đủ (có thể kế thừa từ `ColorModeContext` nếu đã sẵn, không bắt buộc mở rộng trong change này).
- Hạ tầng i18n hoặc catalog message đa ngôn ngữ (out of scope cho đợt này).

## Decisions

1. **Single source for return URL** — Mọi chỗ ghi `sessionStorage` cho URL quay lại sau login dùng `KEY_SESSION_STORAGE.RETURN_URL`; sửa literal `'returnUrl'` trong `RefineContext` `logout`.
2. **Session gate stays in `RefineContext`** — Không tách provider mới trừ khi file vượt ngưỡng bảo trì sau khi gọn logic; ưu tiên `useEffect` với dependency đầy đủ (`pathname`, `status`, `session?.expires`) và một cờ “bootstrap complete” rõ ràng thay vì `isDomLoaded` gắn với mọi nhánh effect.
3. **UI tokens** — `AuthCard` subtitle và các text phụ: chuyển sang lớp màu hub (ví dụ `text-hub-muted` hoặc token tương đương trong `tailwind.config` / globals) thay cho `text-slate-600`; card/footer/header dùng `CustomCard` props đã có.
4. **Lỗi đăng nhập** — Map `signIn` / `useLogin` errors sang chuỗi tiếng Việt an toàn, có thể tập trung trong constants nhỏ trong `components/module/auth` hoặc inline map; giữ `notification.error` hoặc chuyển sang `useNotification` của Refine nếu đồng bộ với phần còn lại của app (một channel duy nhất cho auth errors trên public pages).
5. **Pages** — Giữ default export cho `page.tsx` theo convention Next.js hiện tại của dự án; không đổi sang named export ở page files (tránh xung đột App Router). Logic UI vẫn trong module với named exports.

## Risks / Trade-offs

- **[Risk] Redirect flash hoặc vòng lặp** khi `replace` và `useEffect` chạy lại → **Mitigation**: dùng `router.replace`, tránh `push`; early `return` trong effect khi không có thay đổi trạng thái; kiểm thử `/login`, `/register`, `/forget-password`, deep link `/dashboard`.
- **[Risk] `MainContext` loading toàn màn** che auth trong flow hiếm → **Mitigation**: audit mọi `handleLoading(true)` trên public routes; không bật global loading cho thao tác chỉ cần button `loading`.

## Migration Plan

1. Triển khai trên branch feature; QA thủ công các luồng: guest login, guest register, forget password, authenticated mở `/login`, session hết hạn (mock bằng shorten session hoặc devtools), logout từ dashboard rồi login lại với return URL.
2. Rollback: revert commit; không migration dữ liệu.

## Open Questions

- Post-login default có bao giờ khác `/dashboard` theo role hay không (hiện giữ `/dashboard` theo code).
