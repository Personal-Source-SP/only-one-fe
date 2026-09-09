---
id: 20260909-141800-dev-route-transition-latency
title: Tối ưu Tốc độ Compile On-Demand và Độ trễ Chuyển Route trong Next.js Turbopack
archived_at: 2026-09-09
status: active
references: []
affected_modules:
  - next.config.mjs
---

# Archive: Tối ưu Tốc độ Compile On-Demand và Độ trễ Chuyển Route trong Next.js Turbopack

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**:
  - Khi chạy `next dev --turbo`, việc chuyển trang lần đầu tiên trên giao diện gặp độ trễ lớn (compile latency) do Turbopack phải kích hoạt Node.js Babel process để parse và transform `babel-plugin-react-compiler` khi cờ `reactCompiler: true` được bật.
- **Giá trị (Value)**:
  - Chuyển trang mượt mà ngay lập tức trong quá trình phát triển (dev mode), giảm tải CPU và tăng tốc độ phản hồi on-demand compile của Next.js Turbopack.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Tạm tắt React Compiler trong môi trường Dev**:
  - Vô hiệu hóa `reactCompiler: false` trong `next.config.mjs` cho đến khi Turbopack tích hợp compiler native qua Rust SWC.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [next.config.mjs](file:///Users/kiem/Sources/PERSONAL/only-one-fe/next.config.mjs): Tắt `reactCompiler`.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: Compile route chuyển từ vài giây xuống dưới 100ms.
