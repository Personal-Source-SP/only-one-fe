## 1. Session gate và storage

- [x] 1.1 Sửa `authProvider.logout` trong `src/contexts/RefineContext.tsx` để dùng `KEY_SESSION_STORAGE.RETURN_URL` thay cho literal `'returnUrl'`.
- [x] 1.2 Rà soát `useEffect` session redirect: dependency đầy đủ (`status`, `session`, `pathname`); tách hoặc đổi tên cờ bootstrap để tránh `isDomLoaded` true khi chưa xử lý redirect.
- [x] 1.3 Đảm bảo thứ tự xử lý: `loading` → authenticated trên public page → `replace` dashboard; unauthenticated trên protected → lưu return URL → `replace` login; expired session trên protected → `signOut` + return URL.
- [x] 1.4 Kiểm tra không chồng `MainContext` global loading với nút submit form trên các trang `(public)`.

## 2. UI hub tokens và layout auth

- [x] 2.1 Cập nhật `src/components/module/auth/AuthCard.tsx`: subtitle và header dùng token hub (bỏ `text-slate-600` ad-hoc); semantic `header` / heading theo spec.
- [x] 2.2 Rà soát `AuthLayout`, `AuthSocialLogin`, footer links trong các `page.tsx` — spacing, max-width, overflow mobile.
- [x] 2.3 Căn chỉnh `CustomCard` / `CustomSpace` nếu cần token class từ `custom-components.constant` hoặc Tailwind `hub-*`.

## 3. Lỗi form (không dùng i18n)

- [x] 3.1 Map lỗi NextAuth/`signIn`/`useLogin` sang thông báo tiếng Việt an toàn cho user (constants nhỏ trong module hoặc map inline); đảm bảo nhánh `success: false` không im lặng.
- [x] 3.2 Thống nhất kênh báo lỗi (notification Refine vs Ant Design) cho public auth.

## 4. Trang `(public)` và barrel

- [x] 4.1 Xác nhận `login`, `register`, `forget-password` pages chỉ compose từ barrel `@/components/module/auth` và `@/components/custom`.
- [x] 4.2 Cập nhật `src/app/(public)/layout.tsx` nếu cần (ví dụ metadata) — tối thiểu, bám spec.

## 5. QA và chất lượng

- [ ] 5.1 QA thủ công các luồng trong `design.md` (guest, authenticated vào `/login`, logout + return URL, hết hạn session nếu có cách kiểm tra).
- [x] 5.2 Chạy `npm run lint` và sửa cảnh báo phát sinh trong phạm vi file đã đụng.
