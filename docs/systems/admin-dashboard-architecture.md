# Admin Dashboard Frontend – Architecture Blueprint

> Tài liệu này mô tả kiến trúc tổng quát để xây dựng một hệ thống **Admin Dashboard Frontend** theo phong cách modular, domain-driven. Tài liệu không gắn với một dự án cụ thể, có thể áp dụng lại cho bất kỳ hệ thống quản trị nào cùng ngăn xếp công nghệ.
>
> Tài liệu tham chiếu từ kiến trúc thực tế của dự án `only-one-fe`.

---

## 1. Loại ứng dụng

Tài liệu này áp dụng cho loại ứng dụng:

- **Admin Dashboard / Internal Tool**: giao diện quản trị nội bộ, không phải marketing site
- Có **authentication** (login/logout, session, token)
- Có **nhiều domain feature** phân tách theo chức năng (CRUD-heavy)
- Cần **realtime** hoặc background job visibility
- Hỗ trợ **responsive** trên mobile, tablet, desktop
- Hướng **mở rộng lâu dài** — không viết một lần rồi bỏ

---

## 2. Ngăn xếp công nghệ chuẩn

| Tầng | Công nghệ được khuyến nghị | Ghi chú |
|---|---|---|
| Framework | `Next.js` (App Router) | Không dùng Pages Router |
| UI Runtime | `React 19+` | |
| Language | `TypeScript` strict | |
| UI Foundation | `Ant Design 5` | Component library chính |
| Layout/Responsive | `Tailwind CSS` | Utility-first |
| CSS Utility phụ | `DaisyUI` | Tùy chọn, devDependency |
| Data/CRUD | `Refine.dev` | CRUD orchestration |
| Authentication | `NextAuth` | CredentialsProvider + JWT |
| HTTP Client | `Axios` | Qua base service wrapper |
| State nhẹ | `Zustand` | Không dùng Redux cho state UI |
| Realtime | `socket.io-client` | Tùy chọn theo yêu cầu |
| i18n | `next-intl` | Chuẩn bị sẵn, dùng dần |
| Utilities | `dayjs`, `lodash`, `query-string`, `jwt-decode` | |
| Code quality | `eslint`, `prettier`, `husky`, `lint-staged` | |

---

## 3. Kiến trúc tổng thể

Hệ thống được tổ chức theo **6 tầng trách nhiệm**:

```
┌──────────────────────────────────────────────┐
│  1. Route & Layout Shell  (App Router)        │  ← app/
├──────────────────────────────────────────────┤
│  2. UI Foundation Layer   (custom wrappers)   │  ← components/custom/
├──────────────────────────────────────────────┤
│  3. Shared UI Layer       (composed widgets)  │  ← components/common/
│     Shell Chrome          (nav, header)       │  ← components/layout/
├──────────────────────────────────────────────┤
│  4. Data Layer            (Refine + provider) │  ← providers/
│                           (service layer)     │  ← services/
│                           (hook adapters)     │  ← hooks/
├──────────────────────────────────────────────┤
│  5. Domain Contract Layer (types, enum, const)│  ← interfaces/ enums/ constants/
├──────────────────────────────────────────────┤
│  6. Runtime Coordination  (context, store)    │  ← contexts/ stores/
└──────────────────────────────────────────────┘
```

Nguyên lý xuyên suốt:

- **Page phải mỏng** — page chỉ compose, không chứa business logic phức tạp
- **Feature tách theo domain** — không tách theo loại file (tránh `components/table/` cho mọi domain)
- **Shared contract tập trung** — interfaces, enums, constants không nằm rải rác
- **UI đi qua wrapper** — không import UI library trực tiếp vào page nếu đã có wrapper

---

## 4. Cấu trúc thư mục chuẩn

```text
<project-name>/
├── docs/
│   └── systems/
├── public/
├── src/
│   ├── app/
│   │   ├── (public)/            ← routes không cần auth
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forget-password/
│   │   │   └── layout.tsx
│   │   ├── (root)/              ← protected shell
│   │   │   ├── dashboard/
│   │   │   ├── <domain-a>/
│   │   │   │   ├── <resource-1>/
│   │   │   │   ├── <resource-2>/
│   │   │   │   └── layout.tsx
│   │   │   ├── setting/
│   │   │   │   ├── users/
│   │   │   │   ├── appearance/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx     ← redirect sang sub-route
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/            ← NextAuth handler
│   │   │   ├── health/          ← health check
│   │   │   └── proxy-image/     ← proxy media nếu cần
│   │   ├── auth/
│   │   │   └── cleanup-session/ ← dọn session khi logout
│   │   ├── forbidden.tsx        ← trang 403
│   │   ├── not-found.tsx        ← trang 404
│   │   ├── layout.tsx           ← root layout
│   │   └── page.tsx             ← redirect entry point
│   │
│   ├── components/
│   │   ├── custom/              ← UI library wrappers
│   │   ├── common/              ← reusable composed widgets
│   │   └── layout/              ← shell chrome (header, sidebar, tabs)
│   │
│   ├── constants/               ← navigation, theme, shared config
│   ├── contexts/                ← runtime contexts
│   ├── enums/                   ← domain + UI enums
│   ├── hooks/                   ← custom hooks, Refine adapters
│   ├── interfaces/              ← TypeScript contracts
│   ├── libs/                    ← utility/helper functions
│   ├── providers/               ← Refine + data + access control providers
│   ├── services/                ← class-based API services
│   ├── stores/                  ← Zustand stores
│   ├── styles/                  ← globals.css, CSS variables
│   ├── types/                   ← type augmentation (next-auth.d.ts, ...)
│   └── middleware.ts            ← auth guard, redirect logic
│
├── .env
├── .env.sample
├── eslint.config.mjs
├── Dockerfile
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 5. Ý nghĩa từng tầng `src/`

| Thư mục | Vai trò | Quy tắc chính |
|---|---|---|
| `app/` | Route tree, layouts, API routes | Mỗi domain có `layout.tsx` riêng |
| `components/custom/` | Wrappers quanh UI library | Không import thẳng antd khi đã có wrapper |
| `components/common/` | Reusable composed widgets | Tái sử dụng được giữa nhiều feature |
| `components/layout/` | Shell chrome | Header, sidebar, tabs, notifications |
| `constants/` | Config tập trung | Navigation là single source of truth |
| `contexts/` | Runtime context | Không lạm dụng context cho UI state cục bộ |
| `enums/` | Domain enums | Enum thay vì union literal cho constant |
| `hooks/` | Custom hooks | Nhiều hook là Refine adapter |
| `interfaces/` | TypeScript contracts | Phân theo domain: `<domain>.d.ts` |
| `libs/` | Pure utility/helper | Không chứa React code, không side-effect |
| `providers/` | Refine + data providers | Adapter giữa Refine và REST backend |
| `services/` | Class-based services | Chỉ cho flow không phù hợp với Refine CRUD |
| `stores/` | Zustand stores | State UI-global nhẹ |
| `styles/` | Global CSS, tokens | Không viết page-specific CSS ở đây |
| `types/` | Type augmentation | `next-auth.d.ts`, module declarations |
| `middleware.ts` | Auth guard | Redirect unauthenticated users |

---

## 6. Route và layout strategy

### 6.1 Route group phân tách public/protected

```
src/app/
├── (public)/     ← không cần auth: login, register, forgot-password
└── (root)/       ← cần auth: toàn bộ admin shell
```

- `(public)` có `layout.tsx` tối giản (không có sidebar, không check auth)
- `(root)` có `layout.tsx` chứa toàn bộ admin shell + provider tree
- `app/page.tsx` đơn giản là redirect entry point (→ `/dashboard`)
- `middleware.ts` là lớp bảo vệ cuối cùng cho server-side redirect

### 6.2 Section layout pattern

Mỗi domain trong `(root)` có `layout.tsx` riêng để:
- Hiển thị section-specific tabs
- Inject section-specific context nếu cần
- Cô lập nested shell mà không ảnh hưởng root layout

```
(root)/
├── layout.tsx              ← root protected shell (sidebar, header)
├── dashboard/
├── <domain-a>/
│   ├── layout.tsx          ← section shell (section tabs)
│   ├── components/         ← component cục bộ chỉ dùng trong section
│   ├── <resource-1>/
│   │   └── page.tsx
│   └── <resource-2>/
│       └── page.tsx
```

### 6.3 API routes

```
app/api/
├── auth/[...nextauth]/     ← bắt buộc: NextAuth handler
├── health/                 ← bắt buộc: health check endpoint
└── proxy-image/            ← tùy chọn: proxy media từ external source
```

Frontend không coi local API routes là backend chính. Backend thật ở external server, truy cập qua `NEXT_PUBLIC_API_URL`.

### 6.4 Provider tree

Thứ tự provider từ ngoài vào trong:

```
app/layout.tsx
  → UILibraryRegistryProvider    ← SSR registry (Ant Design)
  → MainContext                  ← loading, message, notification
  → RefineContext
      → SessionProvider          ← NextAuth session
      → ColorModeContextProvider ← light/dark
      → ThemePaletteContext       ← custom palette
      → BreakpointStoreSync       ← responsive sync
      → Refine
          → routerProvider
          → authProvider
          → accessControlProvider
          → notificationProvider
          → dataProvider
  → Protected layout (sidebar, header, tabs)
  → Section layout
  → Page
```

### 6.5 Navigation — single source of truth

Navigation của sidebar **không được hard-code ở nhiều nơi**. Phải có một file constant duy nhất định nghĩa:
- Top-level sections
- Children pages
- Labels, icons, entry href, ordering

```ts
// src/constants/sidebar.constant.ts
export const SIDEBAR_MENU = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: '...',
    href: '/dashboard',
  },
  {
    key: 'domain-a',
    label: 'Domain A',
    children: [
      { key: 'resource-1', label: 'Resource 1', href: '/domain-a/resource-1' },
    ],
  },
  // ...
]
```

---

## 7. Component layer

### 7.1 Ba lớp component

```
components/
├── custom/      ← lớp 1: UI library wrappers
├── common/      ← lớp 2: reusable composed widgets
└── layout/      ← lớp 3: shell chrome
```

Quy tắc sử dụng:

| Tình huống | Import từ đâu |
|---|---|
| Cần button, input, modal, table | `@/components/custom` |
| Cần data table container, filter panel, loading | `@/components/common` |
| Cần sidebar, header, section tabs | `@/components/layout` |
| Component chỉ dùng trong một section | `app/(root)/<section>/components/` |
| Không được | Import thẳng `antd` vào page |

### 7.2 `components/custom/` — UI Library Wrappers

Wrap toàn bộ các component của Ant Design (hoặc UI library đang dùng):

```
custom/
├── custom-button/
├── custom-card/
├── custom-config-provider/   ← theme token mapping
├── custom-data-table/
├── custom-form/
├── custom-input/
├── custom-modal/
├── custom-select/
├── custom-table/
├── custom-tabs/
├── custom-tag/
├── custom-flex/
├── custom-grid/
├── ...
└── index.ts
```

Mỗi wrapper:
- inject className chung
- set defaults phù hợp với app
- bind theme tokens
- export với typing nhất quán

### 7.3 `components/common/` — Composed Widgets

Widgets đã được compose từ `custom/` hoặc native HTML, dùng được ở nhiều feature:

```
common/
├── data-table-container/     ← table shell với pagination, filter, actions
├── filter-panel/             ← filter row với nhiều input
├── form-modal-layout/        ← layout cho form bên trong modal
├── loading/                  ← loading state
├── empty/                    ← empty state
├── status-tag/               ← tag hiển thị trạng thái
├── stat-card/                ← card số liệu thống kê
├── pagination-controls/      ← control phân trang
├── media-lightbox/           ← lightbox cho ảnh/media
├── content-section/          ← section wrapper có title
├── data-not-found/           ← empty state dành riêng cho data
├── not-found/                ← trang 404 component
├── forbidden/                ← trang 403 component
└── index.ts
```

### 7.4 `components/layout/` — Shell Chrome

```
layout/
├── sidebar/                  ← main navigation
├── header/                   ← top bar
├── section-tabs/             ← tabs chuyển sub-route trong section
├── notifications-panel/      ← notification drawer/panel
├── search/                   ← global search
├── scroll-to-top/            ← scroll utility
└── index.tsx                 ← export + compose thành AppLayout
```

---

## 8. Data architecture

### 8.1 Phân công giữa Refine và Service

```
Loại flow                          → Dùng gì
─────────────────────────────────────────────────────
CRUD list + filter + pagination    → Refine useList + data provider
CRUD create/edit/delete            → Refine useCreate/useUpdate/useDelete
Select options từ remote           → Refine useSelect (wrapped)
Login / refresh token              → service class
Special endpoint không phải CRUD  → service class hoặc custom hook
```

### 8.2 Data provider (`src/providers/data-provider.ts`)

Adapter từ Refine DataProvider sang REST backend. Trách nhiệm:

```
Refine query             →  REST query param
──────────────────────────────────────────────
filters                  →  filter.<field>=<op>:<value>
sorters                  →  sortBy=field:ASC|DESC
pagination               →  page=N&limit=N
session token            →  Authorization: Bearer <token>
error response           →  normalize về shape Refine hiểu
```

### 8.3 Service layer (`src/services/`)

```
services/
├── base.service.ts      ← Axios wrapper, token attach, error handle
├── auth.service.ts      ← login, logout, refresh token
└── index.ts
```

Pattern:

```ts
export class AuthService {
  async login(credentials: LoginPayload): Promise<AuthResponse> { ... }
  async refreshToken(token: string): Promise<TokenResponse> { ... }
}
```

### 8.4 Hook adapters (`src/hooks/`)

Hooks là adapter giữa page và Refine/service, giúp page không cần biết chi tiết Refine:

```
hooks/
├── useTableContainer.ts       ← table state + pagination + filter wrapper
├── useCustomData.ts           ← useList/useOne wrapper
├── useCustomDelete.ts         ← useDelete wrapper có confirm
├── useCustomModal.ts          ← modal state + form ref
├── useCustomSelect.ts         ← useSelect wrapper cho dropdown
├── useDebounceSearch.ts       ← debounced search input
├── useHydratedStore.ts        ← SSR-safe Zustand hydration
├── useLocalStorage.ts         ← localStorage abstraction
├── useMessage.ts              ← notification message wrapper
├── useSearchParamsString.ts   ← URLSearchParams helper
├── useSocket.ts               ← Socket.io connection hook
└── index.ts
```

---

## 9. Authentication và session flow

### 9.1 Flow chuẩn

```
1. User điền form login (route public)
2. NextAuth CredentialsProvider gọi authService.login()
3. Backend trả accessToken + refreshToken
4. Frontend decode JWT để lấy user info
5. Session được lưu trong NextAuth JWT session (server-side)
6. Khi token hết hạn: tự động refresh qua authService.refreshToken()
7. Nếu refresh thất bại: sign out, redirect về /login
```

### 9.2 Auth bridge với Refine

```
NextAuth session  →  RefineContext.authProvider
                  →  dataProvider (attach bearer token)
                  →  accessControlProvider (check permissions)
```

### 9.3 Redirect behavior

| Tình huống | Hành vi |
|---|---|
| Đã auth → vào `/login` | Redirect → `/dashboard` |
| Chưa auth → vào protected route | Redirect → `/login?return_url=...` |
| Token hết hạn trong app | Sign out + redirect → `/login` |
| Đăng nhập thành công | Restore `return_url` nếu có, hoặc → `/dashboard` |

### 9.4 Session cleanup

Khi logout hoặc session bị invalidate, cần route cleanup (ví dụ `/auth/cleanup-session`) để:
- Xóa cookie client-side
- Clear local state
- Redirect về login

---

## 10. State và context management

### 10.1 Phân chia trách nhiệm

| State type | Dùng gì | Ví dụ |
|---|---|---|
| Shell-level runtime | React Context | loading, notification, message |
| Auth + CRUD orchestration | React Context (RefineContext) | session, authProvider |
| Theme, color mode | React Context | light/dark, palette |
| UI-global nhẹ | Zustand store | breakpoint, theme mode preference |
| Realtime connection | React Context (SocketContext) | socket instance, connection state |
| Local UI state | useState | modal open, selected row, tab index |

### 10.2 Contexts cần có

```
contexts/
├── MainContext.tsx          ← loading, message, notification toàn app
├── RefineContext.tsx        ← Refine bootstrap + NextAuth session bridge
├── ColorModeContext.tsx     ← light/dark mode
├── ThemePaletteContext.tsx  ← custom color palette
├── BreakpointStoreSync.tsx  ← sync window breakpoint → Zustand
├── SocketContext.tsx        ← realtime (tùy chọn)
├── UILibraryRegistry.tsx   ← SSR registry (Ant Design)
└── index.ts
```

### 10.3 Zustand stores cần có

```
stores/
├── useBreakpointStore.ts   ← current breakpoint (mobile/tablet/desktop)
├── useThemeStore.ts        ← theme mode + palette preference
└── index.ts
```

> Không đưa state cục bộ (modal open, selected rows) lên global store.

---

## 11. Page patterns

### 11.1 List page pattern

```tsx
export default function ResourceListPage() {
  // 1. Table state
  const { tableProps, filters, setFilters, sorters } = useTableContainer({ resource: '...' })

  // 2. Filter options
  const { selectProps: statusOptions } = useCustomSelect({ resource: 'statuses' })

  // 3. Delete action
  const { handleDelete } = useCustomDelete({ resource: '...' })

  // 4. Modal cho create/edit
  const { open, modalProps, formProps, openCreate, openEdit } = useCustomModal({ resource: '...' })

  return (
    <>
      <ActionBar onAdd={openCreate} />
      <FilterPanel filters={[...]} />
      <DataTableContainer
        tableProps={tableProps}
        columns={columns}
        rowActions={(record) => (
          <RowActions onEdit={() => openEdit(record)} onDelete={() => handleDelete(record.id)} />
        )}
      />
      <ResourceFormModal open={open} modalProps={modalProps} formProps={formProps} />
    </>
  )
}
```

### 11.2 Form modal pattern

```tsx
function ResourceFormModal({ open, modalProps, formProps }) {
  return (
    <CustomModal {...modalProps}>
      <FormModalLayout>
        <CustomForm {...formProps}>
          {/* fields */}
        </CustomForm>
      </FormModalLayout>
    </CustomModal>
  )
}
```

### 11.3 Display mode pattern (cho media/gallery page)

```ts
// Enum
enum DisplayMode { TABLE = 'table', GRID = 'grid', ALBUM = 'album' }

// State cục bộ trong page
const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.TABLE)
```

---

## 12. Styling và theming

### 12.1 Kết hợp 3 lớp

| Lớp | Công dụng |
|---|---|
| Ant Design | Base component styling, design tokens |
| Tailwind CSS | Spacing, layout, responsive utilities |
| CSS variables | Theme token bridging (globals.css) |

Không viết plain CSS page-specific nếu Tailwind và wrapper đã giải quyết được.

### 12.2 Theme strategy

```
custom-config-provider  ← map Ant Design tokens với app palette
ColorModeContext         ← toggle light/dark
ThemePaletteContext      ← custom color palette per mode
useThemeStore (Zustand)  ← lưu preference vào localStorage
hub-theme.constant.ts    ← định nghĩa tất cả token giá trị
```

### 12.3 Responsive strategy

```
BreakpointStoreSync     ← sync window.innerWidth → useBreakpointStore
useBreakpointStore      ← truy vấn breakpoint hiện tại trong component
Tailwind breakpoints    ← responsive utility classes
Sidebar                 ← collapse trên mobile
Table                   ← alternate display mode khi quá rộng
```

---

## 13. Type system và conventions

### 13.1 Alias import

```ts
// Đúng
import { CustomButton } from '@/components/custom'
import { useTableContainer } from '@/hooks'
import { UserInterface } from '@/interfaces'
import { StatusEnum } from '@/enums'

// Sai
import { CustomButton } from '../../components/custom/custom-button/CustomButton'
```

### 13.2 Barrel exports

Mỗi thư mục shared phải có `index.ts`:

```ts
// src/hooks/index.ts
export * from './useTableContainer'
export * from './useCustomData'
export * from './useCustomModal'
// ...
```

### 13.3 Export convention

- **Named export**: tất cả component, hooks, utils, enums, interfaces
- **Default export**: chỉ `page.tsx` và `layout.tsx` (theo convention Next.js)

### 13.4 File naming

```
<domain>.d.ts              ← interface file
<domain>.enum.ts           ← enum file
<domain>.constant.ts       ← constant file
<domain>.service.ts        ← service file
use<Entity><Action>.ts     ← hook file
<ComponentName>.tsx        ← component file (PascalCase)
index.ts / index.tsx       ← barrel
```

### 13.5 Component structure trong `.tsx`

```tsx
function MyComponent({ prop }: Props) {
  // 1. Constants
  const ITEMS_PER_PAGE = 10

  // 2. State
  const [open, setOpen] = useState(false)

  // 3. Memos
  const filteredData = useMemo(() => ..., [data])

  // 4. Effects
  useEffect(() => { ... }, [])

  // 5. Callbacks
  const handleClick = useCallback(() => { ... }, [])

  // 6. JSX
  return <div>...</div>
}
```

### 13.6 Interfaces — phân theo domain

```
interfaces/
├── auth.d.ts              ← User, Session, Token interfaces
├── base-api.d.ts          ← ApiResponse, Pagination, Filter types
├── common.d.ts            ← shared types dùng nhiều domain
├── custom-component.d.ts  ← Props types cho custom components
├── <domain>.d.ts          ← per-domain types
└── index.ts
```

### 13.7 Enums — phân theo domain

```
enums/
├── common.enum.ts         ← Status, SortOrder, DisplayMode
├── role.enum.ts           ← UserRole
├── <domain>.enum.ts       ← per-domain enums
└── index.ts
```

---

## 14. Libs — pure utility functions

```
libs/
├── api-url-helper.ts          ← build API URL từ base + path + params
├── auth-session-helper.ts     ← decode/validate JWT session
├── auth-session-cookie.ts     ← cookie operations cho auth
├── date-helper.ts             ← dayjs wrappers (format, parse, diff)
├── image-helper.ts            ← image URL, resize, CORS proxy
├── layout-helper.ts           ← responsive layout calculations
├── object-helper.ts           ← deep clone, pick, omit
├── string-helper.ts           ← truncate, slugify, capitalize
└── index.ts
```

Quy tắc:
- Không chứa React code
- Không có side effects (network call, DOM manipulation)
- Pure functions, dễ test

---

## 15. API boundary

```
app/api/auth/[...nextauth]/route.ts  ← bắt buộc: NextAuth handler
app/api/health/route.ts              ← bắt buộc: health check
app/api/proxy-image/route.ts         ← tùy chọn: proxy external images
app/api/<service>/route.ts           ← tùy chọn: proxy API calls cần server
```

Nguyên tắc:
- Local API routes chỉ xử lý infrastructure concerns (auth, proxy, health)
- Business API vẫn ở external backend
- Frontend gọi backend qua `NEXT_PUBLIC_API_URL`

---

## 16. Biến môi trường

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://api.example.com

# NextAuth
NEXTAUTH_URL=https://app.example.com
NEXTAUTH_SECRET=<random-secret>

# Realtime (tùy chọn)
NEXT_PUBLIC_SOCKET_URL=wss://socket.example.com

# External OAuth (tùy chọn)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Server
PORT=4000
```

Quy tắc:
- `NEXT_PUBLIC_*` chỉ dành cho biến an toàn expose cho client
- Secrets không có prefix `NEXT_PUBLIC_`
- Sử dụng `next-runtime-env` để hỗ trợ runtime config (không bake-in khi build Docker)

---

## 17. Blueprint để generate feature mới

Khi thêm một domain feature mới vào hệ thống:

```
Step 1 – Route skeleton
────────────────────────────────────────────
src/app/(root)/<feature>/
├── layout.tsx                    ← section shell + tabs
├── components/                   ← local components (tùy chọn)
├── <resource-a>/
│   └── page.tsx
└── <resource-b>/
    └── page.tsx

Step 2 – Domain contract
────────────────────────────────────────────
src/interfaces/<feature>.d.ts     ← request/response types
src/enums/<feature>.enum.ts       ← status, mode enums
src/constants/<feature>.constant.ts ← labels, keys, defaults

Step 3 – Data layer
────────────────────────────────────────────
src/hooks/useSelect<Entity>.ts    ← dropdown options
src/hooks/use<Entity>Modal.ts     ← modal state
src/services/<feature>.service.ts ← chỉ khi cần special flows

Step 4 – UI composition
────────────────────────────────────────────
Page compose từ:
  - useTableContainer → data + pagination
  - useCustomModal    → create/edit modal
  - useCustomDelete   → delete action
  - DataTableContainer + FilterPanel (từ common/)
  - Custom form modal (local component)

Step 5 – Navigation
────────────────────────────────────────────
Thêm section vào src/constants/sidebar.constant.ts
```

---

## 18. Checklist kiểm tra kiến trúc

Dùng checklist này để review code trước khi merge:

### Structure
- [ ] Page không có business logic dài (> 50 dòng JSX chưa tách component)
- [ ] Feature có `layout.tsx` riêng cho section shell
- [ ] Component mới đặt đúng tầng (`custom/` / `common/` / `layout/` / local)
- [ ] Barrel `index.ts` được cập nhật khi thêm export mới

### Import
- [ ] Dùng `@/...` alias, không dùng relative import `../../`
- [ ] Không import sâu vào child file khi đã có barrel
- [ ] Không import trực tiếp `antd` khi đã có wrapper trong `custom/`

### Data
- [ ] CRUD resource đi qua Refine, không tự fetch
- [ ] Pagination/filter/sort đi qua data provider
- [ ] Special flow mới → thêm vào service hoặc custom hook, không đặt trong page

### Type
- [ ] Props có explicit interface/type
- [ ] API request/response có explicit type
- [ ] Dùng enum thay vì string literal cho domain constant

### Convention
- [ ] Named export cho component/hook/util
- [ ] Default export chỉ cho `page.tsx` và `layout.tsx`
- [ ] File naming đúng pattern: `<domain>.enum.ts`, `use<Entity><Action>.ts`

### UX
- [ ] Page hỗ trợ responsive (mobile/tablet/desktop)
- [ ] Empty state và loading state có xử lý
- [ ] Error có message thống nhất

---

## 19. Những gì không được làm

| Sai | Đúng |
|---|---|
| Tạo `src/pages/` | Dùng `src/app/` (App Router) |
| Import `antd` trực tiếp trong page | Dùng `@/components/custom` |
| Tự gọi `fetch()` trong page cho CRUD chuẩn | Dùng Refine + data provider |
| Đặt business logic trong `page.tsx` | Tách vào hook hoặc component |
| Hard-code navigation ở nhiều file | Dùng `sidebar.constant.ts` duy nhất |
| Deep relative imports (`../../../../components`) | Dùng `@/...` alias |
| Không có barrel `index.ts` | Mỗi folder shared đều có barrel |
| Dùng Context cho tất cả state | Phân biệt: Context (runtime) / Zustand (global UI) / useState (local) |
| Không có responsive handling | Tất cả page và component phải responsive |
| Bỏ qua phân tách public/protected routes | Luôn có `(public)/` và `(root)/` |

---

## 20. Tiêu chí thành công

Một hệ thống được xem là tuân đúng kiến trúc này nếu:

- ✅ Nhìn vào cấu trúc folder nhận ra ngay đây là admin dashboard, không phải marketing site
- ✅ Route tree có phân tách rõ public/protected
- ✅ Tất cả CRUD feature có chung pattern: table + filter + modal + hooks
- ✅ UI không có `antd` import trực tiếp trong page
- ✅ Auth flow, provider tree hoạt động end-to-end
- ✅ Có thể thêm feature mới mà không cần refactor cấu trúc hiện tại
- ✅ Mỗi domain feature độc lập về contract (interface, enum, constant)
- ✅ Navigation là single source of truth
- ✅ Responsive hoạt động trên mobile, tablet, desktop

---

## 21. Tổng kết kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Dashboard App                   │
├──────────────┬──────────────────────────────────────────┤
│   (public)   │              (root) Protected             │
│  login       │  dashboard  │  domain-a  │  setting      │
│  register    │             │  domain-b  │  users        │
│  forgot-pw   │             │  domain-c  │  appearance   │
├──────────────┴──────────────────────────────────────────┤
│          components/layout (sidebar, header, tabs)       │
├──────────────────────────────────────────────────────────┤
│              components/common (widgets)                  │
├──────────────────────────────────────────────────────────┤
│              components/custom (UI wrappers)              │
├──────────────────────────────────────────────────────────┤
│   hooks/   │  providers/  │  services/  │  contexts/    │
│  adapters  │  data + auth │  special    │  runtime      │
├──────────────────────────────────────────────────────────┤
│   interfaces/ │  enums/  │  constants/ │  stores/      │
│   contracts   │  domain  │  config     │  zustand      │
├──────────────────────────────────────────────────────────┤
│                        libs/ (pure utils)                 │
└──────────────────────────────────────────────────────────┘
```

Mỗi tầng có ranh giới trách nhiệm rõ ràng. Không tầng nào biết quá nhiều về tầng khác — page không biết chi tiết Refine, Refine không biết chi tiết backend, backend không biết chi tiết UI.
