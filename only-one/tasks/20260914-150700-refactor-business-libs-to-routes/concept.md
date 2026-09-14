# Concept: Di chuyển Business Libs về Route và Tinh gọn, Phân tách Modular Common Libs

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Thư mục global `src/libs/` của dự án `only-one-fe` đang chứa lẫn lộn các hàm xử lý logic nghiệp vụ đặc thù của từng module/route cùng với các tiện ích dùng chung (Generic Utilities) toàn hệ thống.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - `local-folder-registration.ts` nằm trong `src/libs/` nhưng import trực tiếp 4 domain entities (`IDataProvider`, `IItem`, `IDataProviderItem`, `RegisterLocalFolderRequest`) từ `@/app/(root)/scraping/*`. Đây là 100% domain logic của tính năng Quản lý đối tượng nhà cung cấp (`scraping/provider-items`).
  - `image-helper.ts` chứa hàm `getDriveImageUrl` phụ thuộc trực tiếp vào `IGoogleDriveFile` và `QualityMode` của module Google Drive Photos (`@/app/(root)/google/drive/*`), làm ô nhiễm một helper đáng lẽ phải là generic/reusable (`getProxyUrl`, `isLocalFilePath`).
  - Vi phạm nguyên tắc đóng gói (Colocation / Feature-Sliced Design) và tạo ra phụ thuộc ngược (Inverted Dependencies) từ tầng shared thư viện chung (`src/libs/`) vào tầng giao diện ứng dụng (`src/app/**`).
- **Nguyên nhân cốt lõi (Root Cause)**: Quá trình phát triển gom các hàm helper xử lý dữ liệu vào `src/libs/` mà chưa tách bạch giữa **Route-level Utilities** và **App-wide Generic Libs**.
- **Tác động (Impact / Blast Radius)**: Gây khó khăn khi bảo trì, tăng coupling giữa các module độc lập, vi phạm ranh giới kiến trúc.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  1. Di chuyển toàn bộ helper/business logic đặc thù về đúng thư mục route/feature quản lý (`scraping/provider-items` và `google/drive/photos`).
  2. Tinh gọn `src/libs/` để chỉ chứa các generic utility functions thuần túy, hoàn toàn không phụ thuộc vào `src/app/**`.
  3. Duy trì Barrel Export tại `src/libs/index.ts` cho các common utils để đảm bảo tương thích ngược 100%.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - `local-folder-registration.ts` được chuyển sang `src/app/(root)/scraping/provider-items/utils/local-folder-registration.ts` và loại bỏ khỏi `src/libs/`.
  - `getDriveImageUrl` được chuyển sang `src/app/(root)/google/drive/photos/utils/image.utils.ts` và loại bỏ khỏi `src/libs/image-helper.ts`.
  - Thư mục `src/libs/` sạch 100% không còn bất kỳ import nào trỏ vào `@/app/(root)/**`.
  - Cập nhật 100% import statements liên quan, đảm bảo `tsc --noEmit`, `npm run build` và `npx eslint src/` vượt qua thành công với 0 lỗi.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  1. **Scraping Provider Items (`src/app/(root)/scraping/provider-items/`)**:
     - Tạo thư mục `utils/` và chuyển `local-folder-registration.ts` vào `src/app/(root)/scraping/provider-items/utils/local-folder-registration.ts`.
     - Tạo `src/app/(root)/scraping/provider-items/utils/index.ts` để re-export.
     - Xóa `src/libs/local-folder-registration.ts`.
  2. **Google Drive Photos (`src/app/(root)/google/drive/photos/`)**:
     - Tạo thư mục `utils/` và chuyển `getDriveImageUrl` vào `src/app/(root)/google/drive/photos/utils/image.utils.ts`.
     - Tạo `src/app/(root)/google/drive/photos/utils/index.ts` để re-export.
     - Cập nhật import `getDriveImageUrl` tại `photos/page.tsx` và `photos/hooks.ts`.
  3. **Global Libs (`src/libs/`)**:
     - Tinh gọn `src/libs/image-helper.ts` (chỉ giữ `getProxyUrl`, `isLocalFilePath`).
     - Cập nhật `src/libs/index.ts` bỏ export `local-folder-registration`.
     - Rà soát các helpers còn lại (`api-url-helper.ts`, `auth-session-cookie.ts`, `auth-session-helper.ts`, `date-helper.ts`, `googleapis.ts`, `layout-helper.ts`, `object-helper.ts`, `string-helper.ts`) đảm bảo tính độc lập và generic.

- **Explicit Out-of-Scope**:
  - Không thay đổi logic thực thi runtime hay giao diện UI của các trang.
  - Không can thiệp backend `only-one-be`.

---

## 3. Solution Options & Comparison (Các Phương án Giải pháp)

### Option 1: Clean Colocation & Pure Generic Libs (Khuyến nghị ⭐)
- **Cơ chế**:
  - Chuyển `local-folder-registration.ts` về `src/app/(root)/scraping/provider-items/utils/`.
  - Chuyển `getDriveImageUrl` về `src/app/(root)/google/drive/photos/utils/`.
  - Giữ lại trong `src/libs/` các utility thuần túy (`api-url-helper`, `auth-session-cookie`, `auth-session-helper`, `date-helper`, `googleapis`, `image-helper`, `layout-helper`, `object-helper`, `string-helper`).
- **Ưu điểm**:
  - Ranh giới module rõ ràng, loại bỏ hoàn toàn việc `src/libs/` import ngược vào `src/app/`.
  - Giữ nguyên toàn bộ các helper dùng chung toàn hệ thống, blast radius tối thiểu.
  - Dễ bảo trì, tuân thủ đúng nguyên tắc Single Responsibility và Clean Architecture.
- **Nhược điểm**: Cần cập nhật các file import `getDriveImageUrl` và `local-folder-registration`.

### Option 2: Phân tách Thành Utilities theo Từng Domain Riêng
- **Cơ chế**:
  - Tách nhỏ toàn bộ `src/libs/` và xóa bỏ `src/libs/index.ts` barrel export, bắt buộc các component import từ deep path (e.g. `@/libs/date/formatDate`).
- **Ưu điểm**: Không có barrel file.
- **Nhược điểm**: Phá vỡ tính tiện dụng và tương thích của codebase hiện tại, gây blast radius lớn cho hàng chục component.

---

## 4. Proposed Solution & Core Mechanism (Chi tiết Phương án Chọn: Option 1)

### Mapping Di chuyển & Tái cấu trúc Chi tiết

| Helper / Logic Hiện tại | Vị trí Mới Đề xuất | Lý do & Phạm vi |
| :--- | :--- | :--- |
| `local-folder-registration.ts` (`src/libs/`) | `src/app/(root)/scraping/provider-items/utils/local-folder-registration.ts` | 100% nghiệp vụ đăng ký thư mục cục bộ của Scraping Provider Items |
| `getDriveImageUrl` (trong `src/libs/image-helper.ts`) | `src/app/(root)/google/drive/photos/utils/image.utils.ts` | 100% nghiệp vụ hiển thị ảnh thumbnail/preview của Google Drive Photos |
| `src/libs/image-helper.ts` (đã tinh giản) | Giữ nguyên tại `src/libs/image-helper.ts` (chỉ còn `getProxyUrl`, `isLocalFilePath`) | Generic Image / File Path Utilities dùng chung toàn hệ thống |
| `src/libs/index.ts` | Bỏ export `local-folder-registration` | Barrel re-export toàn bộ Generic Libs sạch |

### Cấu trúc Thư mục `src/libs/` sau khi Tinh gọn (Pure Generic):
```text
src/libs/
├── api-url-helper.ts         # getApiBaseUrl
├── auth-session-cookie.ts    # Session cookie prefixes & validation
├── auth-session-helper.ts    # getSafeServerSession (Server Component Auth)
├── date-helper.ts            # formatDate, calculateDuration, formatTimeVideoPlayer
├── googleapis.ts             # Google OAuth2 Client (exchange token, auth url, userinfo)
├── image-helper.ts           # getProxyUrl, isLocalFilePath (Pure Generic)
├── layout-helper.ts          # getSectionTabs, getSectionBreadcrumbs, getPageTitle
├── object-helper.ts          # enumToOptions, getEnumKeyByValue
├── string-helper.ts          # buildUrl, capitalizeFirstLetter, formatFileSize, slugify
└── index.ts                  # Barrel re-export tất cả generic libs
```

---

## 5. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Broken Callers**:
   - *Rủi ro*: Có component sót import `getDriveImageUrl` hoặc `local-folder-registration` từ `@/libs`.
   - *Giải pháp*: Quét bằng ripgrep và TypeScript compiler (`tsc --noEmit`) để cập nhật toàn bộ sang đường dẫn local route utils (`./utils`).
2. **Circular Dependencies**:
   - *Rủi ro*: Khi tạo `photos/utils` hoặc `provider-items/utils`, nếu import chéo với `hooks.ts` hoặc `types.ts` có thể phát sinh circular dependency.
   - *Giải pháp*: Trong các file `utils`, chỉ import từ `types` và `enums` (leaf files), không import từ `hooks` hay `components`.
