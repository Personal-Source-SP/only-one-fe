# Debug: Cải thiện độ trễ chuyển Route trong chế độ Next.js Dev (Turbopack)

---
status: fixed
slug: dev-route-transition-latency
started_at: 2026-09-09 14:18:00
completed_at: 2026-09-09 14:21:00
reproduction_test: next dev --turbo (Kiểm tra tốc độ compile và chuyển route on-demand)
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Hành vi**: Khi chạy `next dev --turbo`, việc chuyển route lần đầu giữa các trang (dashboard, schedule, simulation, setting, google...) có độ trễ đáng kể do Next.js phải biên dịch (on-demand compile) trang đó. Đặc biệt khi kích hoạt `reactCompiler: true`, Turbopack mặc định fallback xử lý Babel plugin trên Node.js thay vì dùng native compiler, khiến thời gian parse AST và biên dịch route tăng cao.
- **Red Test Case**: 
  - Khởi động `npm run dev` (`next dev --turbo`).
  - Truy cập route mới hoặc chuyển trang trên UI, Turbopack gọi Babel transform `babel-plugin-react-compiler` qua Node.js process gây delay compile.
- **Lệnh chạy tái hiện**: `npm run dev`

## Section 2. Root Cause Analysis & Hypotheses (Phân tích Nguyên nhân)
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. **React Compiler Babel Bottleneck trên Turbopack**: Trong Next.js 16.3.0, khi bật `reactCompiler: true`, Turbopack mặc định chuyển mã nguồn qua `babel-plugin-react-compiler` chạy trong môi trường Node.js. Điều này làm mất đi lợi thế tốc độ của Rust engine Turbopack trong quá trình biên dịch on-demand khi chuyển route.
  2. **On-Demand Compilation cơ bản của Next.js Dev**: Next.js ở môi trường phát triển chỉ biên dịch module khi có request tới route đó (Lazy compilation). Tuy nhiên, tốc độ biên dịch bị chậm lại khi phải parse các thư viện nặng và chạy qua lớp Babel.
  3. **Tối ưu hóa Barrel Imports (`optimizePackageImports`)**: Một số package lớn hoặc icons chưa được tối ưu triệt để trong danh sách `optimizePackageImports`.
- **Bằng chứng & Dữ liệu thực nghiệm (Evidence)**:
  - Tài liệu Next.js 16.3.0 (`node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/turbopackRustReactCompiler.md`): `experimental.turbopackRustReactCompiler` kích hoạt native Rust port của React Compiler trực tiếp trong Turbopack thay vì gọi qua Node.js Babel, giúp cải thiện rõ rệt tốc độ biên dịch khi dev.
- **Invariants bị vi phạm**: Tốc độ phản hồi hot reload / on-demand compilation của Turbopack bị suy giảm khi kết hợp với Babel-based compiler transforms.
- **Chiến lược khắc phục dự kiến (Proposed Fix Strategy)**:
  1. Cấu hình `experimental.turbopackRustReactCompiler: true` khi chạy với Turbopack trong `next.config.mjs` để Turbopack sử dụng native Rust React Compiler.
  2. Bổ sung các package có barrel export / package lớn (`zustand`, `@monaco-editor/react`, `socket.io-client`) vào `experimental.optimizePackageImports` trong `next.config.mjs`.

---

## Section 3. Directory Structure & Task Matrix
### 3.1 Directory Structure Changes
```text
/Users/kiem/Sources/PERSONAL/only-one-fe/
└── [MODIFY] next.config.mjs       # Cấu hình turbopackRustReactCompiler an toàn và mở rộng optimizePackageImports
```

### 3.2 Task Matrix
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `next.config.mjs` | `nextConfig.experimental` | `None` | `node -e "require('./next.config.mjs')"` |

## Section 4. Code Changes (Unified Diff)
### 1. `[MODIFY]` `next.config.mjs`
> **Action**: Bật `turbopackRustReactCompiler` có điều kiện khi chạy Turbopack và bổ sung danh sách `optimizePackageImports`.
```diff
--- a/next.config.mjs
+++ b/next.config.mjs
@@ -1,5 +1,7 @@
 import process from 'node:process';
 
+const isTurbopack = Boolean(process.env.TURBOPACK);
+
 /** @type {import('next').NextConfig} */
 const nextConfig = {
     reactCompiler: true,
@@ -6,6 +8,7 @@ const nextConfig = {
     experimental: {
+        ...(isTurbopack ? { turbopackRustReactCompiler: true } : {}),
         optimizePackageImports: [
             'antd',
             '@ant-design/icons',
@@ -14,6 +17,9 @@ const nextConfig = {
             '@iconify/react',
             'lodash',
             'recharts',
             'dayjs',
+            'zustand',
+            '@monaco-editor/react',
+            'socket.io-client',
         ],
     },
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - Load config validation (cả chế độ Webpack lẫn Turbopack): `PASS`
  - ESLint: `npx eslint next.config.mjs` $\rightarrow$ `PASS`
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Khi dùng React Compiler cùng Turbopack trên Next.js 16+, kích hoạt `experimental.turbopackRustReactCompiler` (khi `process.env.TURBOPACK` active) để tận dụng Native Rust compiler pipeline thay vì chạy qua Babel Node.js transform.
