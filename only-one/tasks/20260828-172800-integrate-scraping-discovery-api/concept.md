# Concept: Tích hợp REST API cho Scraping Discovery Frontend

## 1. Problem Statement & Root Need (Bối cảnh & Vấn đề Cốt lõi)
- **Core Business Problem**: Module Scraping Discovery trên `only-one-fe` (`src/app/(root)/scraping/discovery`) hiện đang sử dụng mock data cục bộ (`mock-data.ts`) để hiển thị danh sách phiên, thông tin chi tiết, danh sách URL và hành động giả lập đẩy vào hàng đợi cào. Khi backend `only-one-be` đã hoàn thiện toàn bộ hệ thống API (`/v1/discovery-sessions`, `/v1/discovery-urls`), Frontend cần được chuyển đổi sang kết nối API thực tế để hoàn thiện luồng người dùng toàn diện (End-to-End User Flow).
- **Target Audience & Core Value**: Người dùng quản trị và vận hành hệ thống cào dữ liệu; cung cấp trải nghiệm quản lý phiên quét link, theo dõi tiến độ thời gian thực, duyệt chất lượng URL và đẩy việc cào dữ liệu thực tế lên server.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - **API Endpoints Configuration**: Định nghĩa các endpoint `DISCOVERY_SESSIONS` và `DISCOVERY_URLS` trong `src/config/endpoint.ts`.
  - **Discovery List Page Integration (`src/app/(root)/scraping/discovery`)**:
    - Thay thế state mock bằng `useCustomTable` hoặc `useCustomList` kết nối tới `API_ENDPOINT.DISCOVERY_SESSIONS.BASE`.
    - Hỗ trợ bộ lọc theo `dataProviderId`, tìm kiếm theo `sessionCode`/`targetUrl`, và phân trang server-side.
    - Cập nhật modal tạo phiên (`CreateSessionModal`) gọi mutation `POST /v1/discovery-sessions` qua `useCustomMutationData`.
  - **Discovery Detail Page Integration (`src/app/(root)/scraping/discovery/[id]`)**:
    - Kết nối `useCustomOne` lấy chi tiết phiên và tổng quan số liệu (`API_ENDPOINT.DISCOVERY_SESSIONS.DETAIL` / `SUMMARY`).
    - Kết nối bảng danh sách URL với `API_ENDPOINT.DISCOVERY_URLS.BASE` kèm bộ lọc `sessionId`, phân trang và tìm kiếm.
    - Kết nối hành động **Batch Enqueue** gọi `POST /v1/discovery-sessions/:id/enqueue-urls`.
    - Hỗ trợ kích hoạt Batch Validate (`POST /v1/discovery-sessions/:id/validate`) và User Review Action (`POST /v1/discovery-urls/:id/user-action`).
  - **Cleanup**: Loại bỏ/dọn dẹp mock data và chuyển giao diện sang sử dụng dữ liệu thực 100%.
- **Explicit Out-of-Scope**:
  - **Sửa đổi Giao diện/Layout lớn**: Giữ nguyên cấu trúc giao diện Section Tabs, Metric Cards, và Ant Design components đã được chuẩn hóa.
  - **WebSocket Live Stream**: Tạm thời sử dụng polling hoặc refetch query tiêu chuẩn từ React Query; WebSocket streaming sẽ là nâng cấp sau.

## 3. Success Metrics (Thước đo Thành công / Definition of Done)
- **Zero Mock Dependency**: Toàn bộ dữ liệu hiển thị trên trang Discovery danh sách và chi tiết được tải từ `only-one-be` API.
- **End-to-End Action Verification**:
  - Tạo session mới thành công và danh sách tự động cập nhật.
  - Chọn nhiều URLs và bấm "Đẩy vào hàng đợi cào" gọi đúng API và cập nhật trạng thái bảng thành `QUEUED`.
  - Bấm duyệt/từ chối URL cập nhật tức thì trạng thái trên UI.
- **Strict Lint & Build Cleanliness**: 0 lỗi TypeScript, 0 lỗi ESLint/Prettier (`npm run build` và `npm run lint` pass 100%).

## 4. Proposed High-Level Approach (Hướng tiếp cận Tổng quan)
- Bổ sung cấu hình endpoint tập trung vào `src/config/endpoint.ts`.
- Cập nhật custom hook `useDiscoveryPage` tại `src/app/(root)/scraping/discovery/hooks.ts` sử dụng `useCustomList`/`useCustomTable` và `useCustomMutationData`.
- Cập nhật custom hook `useDiscoveryDetailPage` tại `src/app/(root)/scraping/discovery/[id]/hooks.tsx` tích hợp `useCustomOne` và `useCustomList`.
- Kết nối các modal và action handlers trực tiếp vào API pipeline chuẩn của dự án.

## 5. Technical English Key Patterns
### 1. Mock-to-Live API Migration
- **Meaning (VI)**: Quá trình chuyển đổi từ tầng dữ liệu giả lập (mock layer) sang tích hợp API thực tế của backend.
- **Grammar / Usage**: `Migrate the UI components from in-memory mock state to live REST API endpoints via custom Refine hooks.`
- **Engineering Example**: *"We migrated the Discovery page from in-memory mock state to live REST API endpoints without altering the visual component hierarchy."*

### 2. Optimistic & Server-Synchronized State
- **Meaning (VI)**: Trạng thái giao diện được đồng bộ hóa tức thì với server thông qua cơ chế refetch hoặc cập nhật lạc quan.
- **Grammar / Usage**: `Trigger background query invalidation upon successful mutation to keep UI state strictly synchronized with the backend.`
- **Engineering Example**: *"The batch enqueue handler invalidates the session and URL queries upon success to maintain strict synchronization with backend queue counts."*

### 3. Contract Parity
- **Meaning (VI)**: Tính tương thích tuyệt đối giữa kiểu dữ liệu (TypeScript types) trên Frontend và hợp đồng DTO trả về từ Backend.
- **Grammar / Usage**: `Ensure 100% contract parity between frontend TypeScript interfaces and backend DTO schemas.`
- **Engineering Example**: *"By aligning `IDiscoverySession` with the backend DTO, we achieved seamless contract parity and eliminated runtime projection errors."*
