# Concept: Di chuyển Business Constants về Route và Tinh gọn, Phân tách Modular Toàn diện (Global & Route Pages)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Thư mục global `src/constants/` của dự án `only-one-fe` đang chứa lẫn lộn các constant đặc thù nghiệp vụ của từng route/tính năng (Scraping code generator templates, Google Drive/Photos slideshow & filter options, Google OAuth scopes) cùng với các constant dùng chung toàn hệ thống.
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - File `src/constants/common.constant.ts` là một "God File" gom nhiều domain độc lập (Date, Storage keys, Pagination, Auth pages, Fallback assets, Google settings).
  - Các route page hiện tại (`dashboard`, `google/drive/photos`, `google/keep`, `scraping/data-providers`, `scraping/discovery`, `scraping/scraping-data`) đang dùng các file đơn lẻ `constants.ts` chứa hỗn hợp dữ liệu giả lập (mock data), cấu hình bảng/cột, options bộ lọc và form schema mà chưa được module hóa theo từng nhóm trách nhiệm.
  - Tồn tại mã dư thừa/trùng lặp (Code Duplication): Các giá trị như `IMAGE_WIDTH_DEFAULT`, `IMAGE_HEIGHT_DEFAULT` trong `common.constant.ts` bị trùng với `src/config/media.ts`.
- **Nguyên nhân cốt lõi (Root Cause)**: Thiếu chuẩn hóa cấu trúc thư mục constants dẫn đến việc dồn code vào 1 file `constants.ts` ở cả cấp độ Global lẫn Route-level.
- **Tác động (Impact / Blast Radius)**: Khó tìm kiếm, khó mở rộng tính năng, tăng nguy cơ xung đột khi commit và vi phạm nguyên tắc Single Responsibility (SRP).

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  1. Phân rã và di chuyển toàn bộ constant nghiệp vụ từ global `src/constants/` về đúng module/route quản lý.
  2. Phân tách modular `src/constants/` thành các file nhỏ, đơn trách nhiệm (`storage.constant.ts`, `pagination.constant.ts`, `date.constant.ts`, `auth.constant.ts`, `system.constant.ts`, `sidebar.constant.ts`, `font.constant.ts`, `hub-theme.constant.ts`, `socket.constant.ts`).
  3. Chuẩn hóa và phân tách các `constants.ts` trong các **Route Pages** thành thư mục modular `constants/` với barrel export `index.ts`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Di chuyển template generators sang `src/app/(root)/scraping/features/constants/feature-templates.constants.ts`.
  - Phân tách `constants.ts` tại các route: `dashboard`, `google/drive/photos`, `google/keep`, `scraping/data-providers`, `scraping/discovery`, `scraping/scraping-data`.
  - Giữ nguyên 100% tương thích ngược thông qua barrel exports `index.ts`, `tsc --noEmit` và `npm run build` thành công không cảnh báo lỗi.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  1. **Global Constants (`src/constants/`)**:
     - Phân rã thành: `auth.constant.ts`, `date.constant.ts`, `font.constant.ts`, `hub-theme.constant.ts`, `pagination.constant.ts`, `sidebar.constant.ts`, `socket.constant.ts`, `storage.constant.ts`, `system.constant.ts`.
     - Xóa: `common.constant.ts`, `auth-errors.constant.ts`, `data-provider.constant.ts`.
     - Re-export toàn bộ trong `src/constants/index.ts`.
  2. **Scraping Features (`src/app/(root)/scraping/features/constants/`)**:
     - Tạo `feature-templates.constants.ts` và export tại `index.ts`.
  3. **Route Pages Constants Modularization**:
     - `src/app/(root)/dashboard/constants/`: `recent-data.constants.ts`, `metrics-data.constants.ts`, `index.ts`.
     - `src/app/(root)/google/drive/photos/constants/`: `view.constants.ts`, `slideshow.constants.ts`, `filter.constants.ts`, `index.ts`.
     - `src/app/(root)/google/keep/constants/`: `keep-options.constants.ts`, `keep-initial-data.constants.ts`, `index.ts`.
     - `src/app/(root)/scraping/data-providers/constants/`: `data-provider-form.constants.ts`, `data-provider-table.constants.ts`, `index.ts`.
     - `src/app/(root)/scraping/discovery/constants/`: `discovery-status.constants.ts`, `discovery-form.constants.ts`, `index.ts`.
     - `src/app/(root)/scraping/scraping-data/constants/`: `filter.constants.ts`, `index.ts`.
  4. **Google Libs**:
     - Định nghĩa `GOOGLE_SCOPES` nội bộ trong `src/libs/googleapis.ts`.

- **Explicit Out-of-Scope**:
  - Không thay đổi logic thực thi runtime hoặc UI components.
  - Không can thiệp sang backend `only-one-be`.

---

## 3. Architecture & Modular File Structure (Cấu trúc Thư mục Chi tiết)

### 3.1 Global `src/constants/`
```text
src/constants/
├── auth.constant.ts         # Public pages & Auth error mapping
├── date.constant.ts         # Date & Time format strings
├── font.constant.ts         # Next Font config
├── hub-theme.constant.ts    # Palette presets & storage key
├── pagination.constant.ts   # Table pagination & sort defaults
├── sidebar.constant.ts      # Navigation menu config
├── socket.constant.ts       # Socket event names
├── storage.constant.ts      # Local & Session storage keys
├── system.constant.ts       # Server messages & default assets
└── index.ts                 # Barrel re-export
```

### 3.2 Route Pages `constants/`
```text
src/app/(root)/
├── dashboard/constants/
│   ├── recent-data.constants.ts       # recentFiles, recentPhotos, recentNotes
│   ├── metrics-data.constants.ts      # storageData, activityData
│   └── index.ts                       # Barrel export
├── google/drive/photos/constants/
│   ├── view.constants.ts              # viewModeOptions, qualityModeOptions, columnOptions
│   ├── slideshow.constants.ts         # SLIDESHOW_DELAY_OPTIONS, SLIDESHOW_DELAY_DEFAULT
│   ├── filter.constants.ts            # filterSearch, ITEMS_PER_PAGE_OPTIONS, ITEMS_PER_PAGE_DEFAULT
│   └── index.ts                       # Barrel export
├── google/keep/constants/
│   ├── keep-options.constants.ts      # colorOptions, labelOptions, sortMenu
│   ├── keep-initial-data.constants.ts # initialNotes, initialNoteLabels
│   └── index.ts                       # Barrel export
├── scraping/data-providers/constants/
│   ├── data-provider-form.constants.ts  # DATA_PROVIDER_INITIAL_VALUES, DATA_PROVIDER_LIMITS
│   ├── data-provider-table.constants.ts # DATA_PROVIDER_COLUMNS_WIDTH
│   └── index.ts                         # Barrel export
├── scraping/discovery/constants/
│   ├── discovery-status.constants.ts  # DISCOVERY_SESSION_STATUS_COLOR_MAP, DISCOVERY_SESSION_STATUS_LABELS
│   ├── discovery-form.constants.ts    # DEFAULT_CREATE_SESSION_VALUES
│   └── index.ts                       # Barrel export
├── scraping/features/constants/
│   ├── common.constants.ts            # Modal width, section classes, Feature Registry
│   ├── feature-form.constants.ts      # Section schema descriptors
│   ├── feature-status.constants.ts    # Status badge color, transitions, labels
│   ├── feature-templates.constants.ts # [MỚI] Default script generators (Cheerio, API, Search)
│   ├── scraping-config.constants.ts   # Cấu hình scraping
│   ├── search-config.constants.ts     # Cấu hình search
│   └── index.ts                       # Barrel export
└── scraping/scraping-data/constants/
    ├── filter.constants.ts            # dataTypeOptions, viewModeOptions, columnDisplayOptions, getFilterSearch
    └── index.ts                       # Barrel export
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **Import Path Consistency**:
   - Sử dụng thư mục `constants/` với file `index.ts` ở mỗi route đảm bảo tất cả câu lệnh import cũ dạng `import { ... } from './constants'` không cần phải viết lại đường dẫn, phòng ngừa rủi ro hỏng import.
2. **Circular Dependencies**:
   - Mỗi file nhỏ chỉ export constant thuần túy, tuyệt đối không import chéo ngược lại từ utils/hooks.
