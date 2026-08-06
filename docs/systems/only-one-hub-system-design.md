# Only One Hub – System Design

## 1. Mục tiêu tài liệu

Tài liệu này mô tả đầy đủ cấu trúc hệ thống frontend **hiện tại** của dự án `only-one-fe`, dựa trên codebase thực tế. Mục tiêu là phục vụ hai nhu cầu song song:

1. **Tài liệu kiến trúc nội bộ**: giúp thành viên mới hoặc AI assistant hiểu rõ cách hệ thống được tổ chức, quy ước đặt tên, phân tầng trách nhiệm, và luồng dữ liệu.
2. **Blueprint để tái tạo**: nếu cần sinh một app mới có cùng phong cách, tài liệu này là source of truth để tái lập:
   - kiểu dự án và công nghệ cốt lõi
   - cách chia layer trong `src/`
   - cách tổ chức route và layout với Next.js App Router
   - cách đóng gói UI qua custom wrapper
   - cách fetch dữ liệu và phân bổ trách nhiệm giữa page, hook, provider, service
   - cách quản lý auth, session, state, context, responsive behavior
   - conventions về naming, barrel export, alias import, enum, interface, component structure

---

## 2. Tổng quan hệ thống

`Only One Hub` là một ứng dụng quản trị nội bộ theo kiểu **dashboard**, được xây dựng trên:

| Tầng | Công nghệ |
|---|---|
| Framework | `Next.js 16` + App Router |
| UI Runtime | `React 19` |
| Language | `TypeScript` (strict) |
| UI Foundation | `Ant Design 5` |
| Layout/Responsive | `Tailwind CSS 3` |
| CSS Utility phụ | `DaisyUI 5` (devDependency) |
| Data/CRUD | `@refinedev/core`, `@refinedev/antd`, `@refinedev/nextjs-router` |
| Authentication | `NextAuth 4` |
| HTTP Client | `Axios` |
| State nhẹ | `Zustand 5` |
| Realtime | `socket.io-client 4` |
| i18n | `next-intl 4` |
| Utilities | `dayjs`, `lodash`, `query-string`, `jwt-decode`, `immer` |
| Media/UI | `react-photo-album`, `yet-another-react-lightbox`, `recharts` |
| Editor | `@monaco-editor/react` |
| Cloud | `firebase` |
| Linting | `eslint 9`, `prettier`, `husky`, `lint-staged` |

Ứng dụng được tổ chức theo mô hình:

- **App Router shell** ở tầng route và layout
- **Refine + data provider** ở tầng data CRUD
- **Custom wrapper layer** ở tầng UI foundation
- **Service + hook + interface + enum + constant** ở tầng domain/shared logic
- **Context + store** ở tầng runtime coordination

> Đây là admin-style frontend có kiến trúc có chủ ý, ưu tiên tái sử dụng, mở rộng domain theo khu vực chức năng, và giữ page ở dạng "mỏng".

---

## 3. Cấu trúc repo thực tế

```text
only-one-fe/
├── docs/
│   └── systems/
│       └── only-one-hub-system-design.md
├── docker/
├── openspec/
├── public/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── components/
│   │   │   ├── forget-password/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (root)/
│   │   │   ├── cloud-data/
│   │   │   │   ├── items/
│   │   │   │   ├── providers/
│   │   │   │   └── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── google/
│   │   │   │   ├── drive/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── folders/
│   │   │   │   │   └── photos/
│   │   │   │   ├── keep/
│   │   │   │   └── layout.tsx
│   │   │   ├── schedule/
│   │   │   │   ├── components/
│   │   │   │   ├── executions/
│   │   │   │   ├── job-events/
│   │   │   │   └── layout.tsx
│   │   │   ├── scraping/
│   │   │   │   ├── components/
│   │   │   │   ├── data-providers/
│   │   │   │   ├── items/
│   │   │   │   ├── provider-items/
│   │   │   │   ├── scraping-data/
│   │   │   │   └── layout.tsx
│   │   │   ├── setting/
│   │   │   │   ├── appearance/
│   │   │   │   ├── users/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── simulation/
│   │   │   │   ├── contexts/
│   │   │   │   ├── items/
│   │   │   │   └── layout.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/        ← NextAuth handler
│   │   │   ├── google/      ← Google API proxy
│   │   │   ├── health/      ← health check
│   │   │   └── proxy-image/ ← proxy remote image/media
│   │   ├── auth/
│   │   │   └── cleanup-session/
│   │   ├── favicon.ico
│   │   ├── forbidden.tsx
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── common/
│   │   ├── custom/
│   │   └── layout/
│   ├── constants/
│   ├── contexts/
│   ├── enums/
│   ├── hooks/
│   ├── interfaces/
│   ├── libs/
│   ├── providers/
│   ├── services/
│   ├── stores/
│   ├── styles/
│   ├── types/
│   └── middleware.ts
├── .env
├── .env.sample
├── .eslintrc.json
├── eslint.config.mjs
├── Dockerfile
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

> **Ghi chú**: `components/module/<feature>` **không tồn tại** trong source hiện tại. Component theo domain được đặt trong `components/common/` (nếu tái sử dụng được) hoặc trong `app/(root)/<section>/components/` (nếu chỉ dùng cho một section).

---

## 4. Ý nghĩa từng tầng `src/`

| Thư mục | Vai trò |
|---|---|
| `src/app` | Route tree, layouts, API routes, shell-level composition |
| `src/components/custom` | Wrappers quanh Ant Design, reusable UI foundations |
| `src/components/common` | Reusable component đã compose ở mức chung |
| `src/components/layout` | Header, sidebar, tabs, shell navigation, shared chrome |
| `src/constants` | Constants dùng chung, navigation map, storage keys, theme config |
| `src/contexts` | Context cho app shell, theme, socket, refine bootstrapping |
| `src/enums` | Enums domain và UI mode |
| `src/hooks` | Custom hooks, nhiều hook là adapter quanh Refine |
| `src/interfaces` | Contracts TypeScript, namespace-based typing cho domain |
| `src/libs` | Utility/helper thuần |
| `src/providers` | Refine providers, access control provider, data provider |
| `src/services` | Class-based API services cho special-purpose flows |
| `src/stores` | Zustand stores |
| `src/styles` | globals.css và token-linked styling |
| `src/types` | Type augmentation (`next-auth.d.ts`) |
| `src/middleware.ts` | Next.js middleware (auth guard, redirect logic) |

---

## 5. Nguyên tắc kiến trúc bắt buộc

1. **Page phải mỏng.** `page.tsx` chủ yếu compose hook, module component, và common/custom component. Không đặt business flow dài và UI phân mảnh trực tiếp trong page.

2. **UI phải đi qua wrapper layer trước.** Ưu tiên `@/components/custom`, sau đó đến `@/components/common`, chỉ dùng `antd` trực tiếp khi wrapper chưa tồn tại và cần mở rộng layer `custom`.

3. **Feature được tách theo domain, không tách theo technical vanity.** Ví dụ: `scraping`, `schedule`, `simulation`, `cloud-data`, `google`, `setting`.

4. **Shared contract phải tập trung.** Types ở `@/interfaces`, enum ở `@/enums`, constants ở `@/constants`, hooks ở `@/hooks`, services ở `@/services`.

5. **Responsive là bắt buộc.** UI phải hoạt động tốt trên mobile, tablet, desktop.

6. **Text UI phải có khả năng i18n.** Dự án tích hợp `next-intl`. Text UI không nên hard-code trực tiếp; nên route qua i18n layer.

7. **Semantic HTML phải được ưu tiên.** Dùng `section`, `nav`, `main`, `header`, `button`, `form` khi phù hợp, tránh overuse `div`.

---

## 6. Kiến trúc route và layout

### 6.1 App Router strategy

Route theo `Next.js App Router`, tách thành hai route group chính:

- `src/app/(public)` — các route không cần đăng nhập
- `src/app/(root)` — shell đã đăng nhập và tất cả khu vực quản trị chính

Trang `src/app/page.tsx` đóng vai trò redirect entry point (redirect về `/dashboard`).

### 6.2 Route manifest thực tế

**Public routes** (`src/app/(public)/`):
```
/login
/register
/forget-password
```

**Protected routes** (`src/app/(root)/`):
```
/dashboard

/google/drive/folders
/google/drive/photos
/google/keep

/scraping/data-providers
/scraping/provider-items
/scraping/items
/scraping/scraping-data

/schedule/executions
/schedule/job-events

/simulation/contexts
/simulation/items

/cloud-data/providers
/cloud-data/items

/setting                  ← có page.tsx riêng (redirect)
/setting/users
/setting/appearance
```

**API routes** (`src/app/api/`):
```
/api/auth/[...nextauth]   ← NextAuth handler
/api/google/              ← Google API proxy
/api/health               ← health check
/api/proxy-image          ← proxy remote image/media
```

**Auth utility** (`src/app/auth/`):
```
/auth/cleanup-session     ← dọn session khi logout
```

**Trang đặc biệt:**
```
/forbidden                ← trang 403
not-found.tsx             ← trang 404
```

### 6.3 Protected app shell

Tất cả route trong `(root)` nằm dưới một shared layout để cùng dùng:
- sidebar
- header
- notification panel
- section tabs
- theme context
- auth-aware provider tree
- socket-aware provider tree

**Provider tree thực tế** (từ ngoài vào trong):
```
app/layout.tsx
  → AntdRegistryProvider
  → MainContext (loading, message, notification)
  → RefineContext
      → SessionProvider (NextAuth)
      → ColorModeContextProvider
      → HubThemePaletteContext
      → BreakpointStoreSync
      → Refine
          → routerProvider
          → authProvider
          → accessControlProvider
          → notificationProvider
          → dataProvider
  → Protected route layout (sidebar, header, section-tabs)
  → Section layout (section-specific tabs/chrome)
  → Page
```

### 6.4 Section layout pattern

Mỗi domain section trong `(root)` có `layout.tsx` riêng để xử lý section tabs, section-specific chrome, hoặc nested shell. Ví dụ:

- `(root)/scraping/layout.tsx`
- `(root)/schedule/layout.tsx`
- `(root)/simulation/layout.tsx`
- `(root)/cloud-data/layout.tsx`
- `(root)/google/layout.tsx`
- `(root)/setting/layout.tsx`

Một số section còn có thư mục `components/` cục bộ cho component chỉ dùng trong section đó.

### 6.5 Navigation structure

Sidebar là source of truth để biểu diễn IA của app, được cấu hình tập trung trong `src/constants/sidebar.constant.ts`.

Các nhóm chức năng chính:
- Dashboard
- Google (Drive Folders / Drive Photos / Keep)
- Scraping (Data Providers / Provider Items / Items / Scraping Data)
- Schedule (Executions / Job Events)
- Simulation (Contexts / Items)
- Cloud Data (Providers / Items)
- Setting (Users / Appearance)

Không hard-code navigation ở nhiều nơi. Layout tabs và sidebar derive từ metadata chung trong `sidebar.constant.ts`.

---

## 7. Domain modules thực tế

### 7.1 Dashboard
- Trang tổng quan, landing page sau đăng nhập
- Stats cards, biểu đồ (`recharts`), widgets hiển thị nhanh

### 7.2 Google
- `drive/folders` — quản lý Google Drive folders
- `drive/photos` — xem ảnh từ Google Drive (photo album, lightbox)
- `keep` — Google Keep / storage-like views
- Có luồng link tài khoản Google riêng với auth chính

### 7.3 Scraping
- `data-providers` — quản lý data providers
- `provider-items` — items thuộc provider
- `items` — scraped items
- `scraping-data` — raw scraping data
- Khu vực thể hiện rõ pattern CRUD + filter + table/list + actions

### 7.4 Schedule
- `executions` — execution schedules
- `job-events` — job events
- Cron-like orchestration views, dùng `cron-parser`

### 7.5 Simulation
- `contexts` — simulation contexts
- `items` — simulation items

### 7.6 Cloud Data
- `providers` — cloud data providers
- `items` — stored cloud data items

### 7.7 Setting
- `users` — user management
- `appearance` — theme/appearance settings
- Setting root có `page.tsx` riêng (redirect sang sub-route)

---

## 8. Kiến trúc UI và component layer

### 8.1 Layering thực tế

UI được tổ chức thành 3 lớp:

1. `components/custom` — Ant Design wrappers
2. `components/common` — reusable composed widgets
3. `components/layout` — shell chrome

> Layer `components/module/<feature>` đã được mô tả trong tài liệu cũ nhưng **không tồn tại trong source hiện tại**. Component theo domain được đặt trong `components/common/` (nếu tái sử dụng được) hoặc trong `app/(root)/<section>/components/` (nếu chỉ dùng cho một section).

### 8.2 `components/custom` – Ant Design wrappers

Đây là lớp quan trọng nhất của design system. Mỗi subfolder tương ứng với một Ant Design component được wrap lại:

```
custom/
├── custom-alert/
├── custom-app/
├── custom-avatar/
├── custom-back-top/
├── custom-badge/
├── custom-button/
├── custom-card/
├── custom-checkbox/
├── custom-config-provider/
├── custom-data-table/
├── custom-date-picker/
├── custom-descriptions/
├── custom-divider/
├── custom-drawer/
├── custom-dropdown/
├── custom-empty/
├── custom-flex/
├── custom-float-button/
├── custom-form/
├── custom-grid/
├── custom-input/
├── custom-link/
├── custom-list/
├── custom-message/
├── custom-modal/
├── custom-notification/
├── custom-pagination/
├── custom-picker/
├── custom-popconfirm/
├── custom-popover/
├── custom-result/
├── custom-row-col/
├── custom-segmented/
├── custom-select/
├── custom-slider/
├── custom-space/
├── custom-spin/
├── custom-statistic/
├── custom-steps/
├── custom-switch/
├── custom-table/
├── custom-tabs/
├── custom-tag/
├── custom-theme/
├── custom-toggle/
├── custom-tooltip/
├── custom-typography/
├── custom-upload/
├── custom-antd-types.ts
└── index.ts
```

Vai trò:
- inject className chung, defaults, theme binding, typing conventions
- đóng vai trò "approved design system surface" của dự án

Page **không** import trực tiếp `antd` nếu đã có wrapper trong `custom`.

### 8.3 `components/common` – Reusable composed widgets

```
common/
├── code-display/
├── content-section/
├── data-not-found/
├── data-table-container/
├── empty/
├── file-group/
├── filter-panel/
├── forbidden/
├── form-modal-layout/
├── loading/
├── logo/
├── media-lightbox/
├── not-found/
├── pagination-controls/
├── stat-card/
├── status-tag/
├── unsaved-changes-notifier-app-router/
└── index.ts
```

### 8.4 `components/layout` – Shell chrome

```
layout/
├── header/
├── hub-theme-palette-action/
├── notifications-panel/
├── scroll-to-top/
├── search/
├── section-tabs/
├── sidebar/
└── index.tsx
```

---

## 9. Data architecture

### 9.1 Refine là CRUD backbone

Hệ thống hiện tại ưu tiên dùng `Refine.dev` để quản lý:
- resource-based CRUD
- table pagination, sorting, filtering
- form/modal integration
- mutation workflow

Page không tự gọi `fetch()` riêng lẻ nếu resource đó đã phù hợp với `Refine`.

### 9.2 Data provider strategy

`src/providers/data-provider.ts` đóng vai trò adapter từ `Refine DataProvider` sang REST backend.

Trách nhiệm:
- Map filters thành query format backend yêu cầu
- Map sorters thành query string
- Map pagination thành `page`, `limit`, `sortBy`
- Attach session token vào request
- Normalize error thành shape hợp lệ cho Refine

Query contract:
- Pagination: `page` và `limit`
- Sort: danh sách `field:ORDER`
- Filter: `filter.<field>=<operator>:<value>`
- Quick search: `search` hoặc `q`

### 9.3 Access control provider

`src/providers/access-control-provider.ts` scaffold interface và điểm gắn vào `Refine`. Implementation hiện tại ở mức permissive, có thể mở rộng.

### 9.4 Service layer strategy

`src/services/` chứa class-based services cho các flow không map đẹp vào CRUD resource:

```
services/
├── auth.service.ts     ← login, refresh token
├── base.service.ts     ← base HTTP client (Axios wrapper)
└── index.ts
```

Kiến trúc phân công:
- CRUD page → ưu tiên `Refine` + hook wrappers
- Special action → service class / custom hook

### 9.5 Hook adapter strategy

`src/hooks/` chứa các hook là adapter quanh Refine:

```
hooks/
├── useCustomData.ts          ← custom useList/useOne wrapper
├── useCustomDelete.ts        ← custom useDelete wrapper
├── useCustomModal.ts         ← modal open/close + form state
├── useCustomSelect.ts        ← custom useSelect wrapper
├── useDebounceSearch.ts      ← debounced search input
├── useHydratedStore.ts       ← SSR-safe Zustand access
├── useLocalStorage.ts        ← localStorage abstraction
├── useMessage.ts             ← Ant Design message API wrapper
├── useSearchParamsString.ts  ← URLSearchParams helper
├── useSocket.ts              ← Socket.io connection hook
├── useTableContainer.ts      ← table state + pagination + filter
└── index.ts
```

Page không phải biết quá nhiều chi tiết Refine; config phức tạp được đưa vào hook dùng chung.

---

## 10. Authentication và session flow

### 10.1 Auth backbone

Authentication backbone là `NextAuth 4` với `CredentialsProvider`.

Flow chuẩn:
1. Người dùng login trên route public
2. `NextAuth` gọi `authService.login(...)`
3. Backend trả `accessToken` + `refreshToken`
4. Frontend decode payload để tạo user info session
5. Token được lưu trong JWT session
6. Khi token hết hạn, frontend refresh thông qua `authService.refreshToken(...)`

### 10.2 Refine auth bridge

Sau khi có session, `RefineContext` sẽ bridge session sang `Refine authProvider` và `dataProvider`. Điều này cho phép:
- Protected routes có check auth
- Request CRUD gửi kèm bearer token
- Logout / unauthorized handling đồng nhất

### 10.3 Redirect behavior

| Trường hợp | Hành vi |
|---|---|
| Authenticated user vào public auth page | Redirect sang `/dashboard` |
| Unauthenticated user vào protected page | Redirect sang `/login` |
| Session hết hạn trong protected app | Sign out, redirect về `/login` |
| Sau đăng nhập thành công | Restore `return_url` nếu có |

Middleware auth guard nằm ở `src/middleware.ts`.

### 10.4 Session cleanup

`src/app/auth/cleanup-session/` xử lý việc dọn session khi logout hoặc phiên bị invalidate.

### 10.5 Google account integration

Ngoài auth chính, app còn có integration với Google APIs qua `src/app/api/google/`. Đây là luồng liên kết tài khoản/authorization riêng, không trộn lẫn với core login flow.

---

## 11. State, context, và runtime coordination

### 11.1 Contexts (`src/contexts/`)

```
contexts/
├── AntdRegistryProvider.tsx    ← Ant Design Next.js SSR registry
├── BreakpointStoreSync.tsx     ← sync breakpoint vào Zustand store
├── ColorModeContext.tsx        ← light/dark mode context
├── HubThemePaletteContext.tsx  ← custom palette context
├── MainContext.tsx             ← loading, message, notification, shell-level actions
├── RefineContext.tsx           ← bootstrap auth + refine + session bridge
├── SocketContext.tsx           ← realtime connection cho private area
└── index.ts
```

### 11.2 Zustand stores (`src/stores/`)

```
stores/
├── album.store.ts          ← Google Photos album state
├── useBreakpointStore.ts   ← responsive breakpoint state
├── useThemeStore.ts        ← theme mode state
└── index.ts
```

### 11.3 Local state

State cục bộ ở page/module vẫn được khuyến dùng cho:
- modal open/close
- selected row ids
- local display mode
- active tab/index

Không đưa state cục bộ lên global store nếu không cần.

---

## 12. Pattern cho page list/detail/form

### 12.1 List page pattern

Một list page thường gồm:
- `useTableContainer` — tạo table state, pagination, filter
- Các `useCustomSelect` hooks — load filter options
- `useCustomDelete` — destructive action
- `useCustomModal` — edit/create modal
- `DataTableContainer` (từ `common`) — hiển thị table/list shell
- Action buttons ở đầu trang
- Filter items được mô tả bằng metadata

List page phải hỗ trợ:
- Server-side pagination
- Filter + sorter
- Row actions
- Responsive table/list presentation
- Batch action khi phù hợp

### 12.2 Form modal pattern

Khi feature có CRUD edit/create:
- Mở form bằng custom modal hook
- Data submit đi qua Refine mutation hoặc service wrapper
- Success → refresh table query
- Error → show message thống nhất

### 12.3 Display mode pattern

Nếu page có media/grid/list:
- Display mode là enum (từ `src/enums/gallery.enum.ts`)
- Filter/layout controls đặt trong filter/action area
- Reuse `media-lightbox`, `react-photo-album` khi cần

---

## 13. Styling, theming, và responsive behavior

### 13.1 Styling strategy

Kết hợp:
- `Ant Design` cho base component
- `Tailwind CSS` cho spacing, layout, responsive utilities
- CSS variables / theme tokens để đồng bộ theme (trong `styles/globals.css`)
- `DaisyUI` chỉ đóng vai trò phụ (devDependency)

Không ưu tiên viết plain CSS riêng lẻ nếu có thể giải quyết bằng Tailwind và wrapper composition.

### 13.2 Theme strategy

- `custom-config-provider` map Ant Design tokens với palette/theme của app
- `ColorModeContext` quản lý light/dark mode
- `HubThemePaletteContext` quản lý custom color palette
- `useThemeStore` (Zustand) lưu theme mode preference
- Theme config tập trung ở `src/constants/hub-theme.constant.ts`

### 13.3 Responsive strategy

Tất cả page và reusable component phải tự động hỗ trợ mobile, tablet, desktop.

- `BreakpointStoreSync` đồng bộ breakpoint vào `useBreakpointStore`
- Dùng flexible stack layout, responsive breakpoints
- Alternate display modes khi dữ liệu quá rộng cho mobile
- Sidebar phải có hành vi responsive (collapse trên mobile)

---

## 14. Type system, naming, và export conventions

### 14.1 Alias import

Ưu tiên `@/...` imports:
- `@/components/custom`
- `@/components/common`
- `@/hooks`
- `@/services`
- `@/interfaces`
- `@/constants`
- `@/enums`

Không import sâu vào child file nếu folder đã có barrel gốc.

### 14.2 Barrel exports

Mỗi folder shared/module quan trọng phải có `index.ts`:
- Ưu tiên `export * from './Xxx'`
- Consumer import từ barrel
- Không deep import vào child file khi đã có barrel

### 14.3 Component exports

- Child component dùng **named export**
- App Router `page.tsx` và `layout.tsx` dùng **default export** theo convention Next.js

### 14.4 Interfaces (`src/interfaces/`)

```
interfaces/
├── auth.d.ts
├── base-api.d.ts
├── cloud-data.d.ts
├── common.d.ts
├── custom-component.d.ts
├── data-provider.d.ts
├── google.d.ts
├── import-data.d.ts
├── schedule.d.ts
├── simulation.d.ts
├── user.d.ts
└── index.ts
```

Conventions:
- Interface/type rõ ràng cho props
- Explicit request/response types cho API interactions
- Enum cho domain constant thay vì union literal
- Empty list check chuẩn: `!list?.length`

### 14.5 Enums (`src/enums/`)

```
enums/
├── cloud-data-provider.enum.ts
├── common.enum.ts
├── component.enum.ts
├── cron-expression.enum.ts
├── data-provider.enum.ts
├── file.enum.ts
├── gallery.enum.ts
├── google-drive.enum.ts
├── role.enum.ts
├── schedule.enum.ts
├── simulation.enum.ts
├── socket.enum.ts
└── index.ts
```

### 14.6 Constants (`src/constants/`)

```
constants/
├── auth-errors.constant.ts
├── common.constant.ts
├── data-provider.constant.ts
├── font.constant.ts
├── hub-theme.constant.ts
├── sidebar.constant.ts     ← source of truth cho navigation
├── socket.constant.ts
└── index.ts
```

### 14.7 Component structure trong `.tsx`

Ưu tiên thứ tự:
1. Constants
2. State
3. Memos
4. Effects
5. Callbacks
6. JSX

Nếu component quá lớn, phải tách theo subcomponent có trách nhiệm rõ.

---

## 15. Libs (`src/libs/`)

```
libs/
├── api-url-helper.ts            ← build API URL
├── auth-session-cookie.ts       ← cookie operations cho auth session
├── auth-session-helper.ts       ← helper decode/validate session
├── date-helper.ts               ← dayjs wrappers
├── googleapis.ts                ← Google API client setup
├── image-helper.ts              ← image URL, processing
├── layout-helper.ts             ← layout calculation utilities
├── local-folder-registration.ts ← local folder registration logic
├── object-helper.ts             ← object manipulation
├── string-helper.ts             ← string manipulation
└── index.ts
```

---

## 16. API boundary và infrastructure edge

| File | Mục đích |
|---|---|
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth handler |
| `src/app/api/google/` | Google API proxy |
| `src/app/api/health/route.ts` | Health check |
| `src/app/api/proxy-image/route.ts` | Proxy remote image/media |
| `src/middleware.ts` | Auth guard, redirect logic |
| `next.config.mjs` | Rewrite phù hợp cho backend REST |

Frontend không coi local API routes là backend business chính. Chức năng chính vẫn ở external API server và frontend gọi qua `NEXT_PUBLIC_API_URL`.

---

## 17. Biến môi trường và runtime config

```
# API
NEXT_PUBLIC_API_URL=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Socket
NEXT_PUBLIC_SOCKET_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Firebase (nếu giữ integration layer)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Server
PORT=
```

Lưu ý:
- Chỉ biến client mới được prefix `NEXT_PUBLIC_`
- Không hard-code secrets
- Phải cho phép runtime config trong Docker/prod deployment (`next-runtime-env`)

---

## 18. Blueprint để generate feature mới

Khi tạo một feature section mới, nên theo template:

```
src/app/(root)/<feature>/
├── layout.tsx
├── components/               ← component cục bộ của section (tùy chọn)
├── <resource-a>/
│   └── page.tsx
└── <resource-b>/
    └── page.tsx

src/hooks/
├── useSelect<FeatureEntity>.ts
├── use<FeatureEntity>Modal.ts
└── use<FeatureEntity>Actions.ts

src/interfaces/
└── <feature>.d.ts

src/enums/
└── <feature>.enum.ts

src/constants/
└── <feature>.constant.ts

src/services/
└── <feature>.service.ts       ← chỉ khi cần special-purpose flows
```

> **Không** có `src/components/module/<feature>/` — component theo domain hiện đặt trong `components/common/` hoặc `app/(root)/<section>/components/`.

---

## 19. Những điều không được generate sai

- Tạo `pages/` router (phải dùng App Router)
- Gom hết component vào `components/` mà không chia `custom/common/layout`
- Để từng page tự fetch REST bằng cách riêng nếu đã có Refine
- Import `antd` trực tiếp khắp nơi khi đã có custom wrapper
- Bỏ qua `Refine` cho những resource CRUD chuẩn
- Không có barrel files `index.ts`
- Dùng deep relative imports dài
- Hard-code navigation ở nhiều file thay vì dùng `sidebar.constant.ts`
- Không có provider tree cho auth/theme/refine
- Bỏ qua responsive handling
- Bỏ qua phân route public/protected separation
- Tạo `components/module/<feature>/` — không tồn tại trong source hiện tại

---

## 20. Tiêu chí thành công cho output được generate

Bản generate được xem là đạt yêu cầu nếu:

- Nhìn vào cấu trúc folder có thể nhận ra đây là một repo cùng phong cách với `only-one-fe`
- Route tree khớp với app dashboard protected/public hiện tại
- Có đầy đủ shared layers và naming conventions
- List pages có pattern CRUD/filter/table/action giống nhau
- Auth flow, provider tree, và data provider được scaffolding đúng cho việc mở rộng tiếp
- UI foundation thống nhất và không bị "copy-paste page by page"
- Có thể tiếp tục phát triển thêm feature mà không cần refactor lại toàn bộ structure

---

## 21. Kết luận

Hệ thống frontend hiện tại của `Only One Hub` là một **dashboard app được tổ chức theo hướng modular, domain-driven ở mức frontend**, với:

- **Refine** làm CRUD backbone
- **NextAuth** làm auth backbone
- **Ant Design custom wrappers** làm UI foundation
- **App Router** làm shell navigation backbone
- **Zustand** làm lightweight state layer
- **Socket.io** làm realtime layer
- **next-intl** làm i18n layer

So với tài liệu phiên bản trước, điểm khác biệt chính trong cấu trúc **thực tế hiện tại**:

| Tài liệu cũ | Thực tế hiện tại |
|---|---|
| `components/module/<feature>/` | Không tồn tại — component domain đặt trong `components/common/` hoặc `app/(root)/<section>/components/` |
| Không đề cập `middleware.ts` | `src/middleware.ts` tồn tại — xử lý auth guard |
| Không đề cập `app/auth/` | `src/app/auth/cleanup-session/` tồn tại |
| Không đề cập `next-intl` | Đã tích hợp `next-intl 4` |
| Không đề cập `recharts`, `react-photo-album`, `monaco-editor` | Đã sử dụng trong production |
| `src/app/api/google/` không đề cập | Tồn tại để proxy Google APIs |
