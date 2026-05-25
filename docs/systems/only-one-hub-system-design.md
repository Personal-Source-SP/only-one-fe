# Only One Hub System Design

## 1. Muc tieu tai lieu

Tai lieu nay mo ta day du cau truc he thong frontend hien tai cua du an `only-one-fe` theo huong vua phan tich kien truc, vua chuyen hoa thanh blueprint de Google Studio co the generate ra mot app moi co cau truc, cach to chuc source, va hanh vi gan giong repo hien tai nhat co the.

Tai lieu nay khong chi dung de "tao giao dien". Muc tieu cua no la tai lap:

- kieu du an va cong nghe cot loi
- cach chia layer trong `src/`
- cach to chuc route va layout voi Next.js App Router
- cach dong goi UI qua custom wrapper
- cach fetch du lieu va phan bo trach nhiem giua page, hook, provider, service
- cach quan ly auth, session, state, context, responsive behavior
- conventions ve naming, barrel export, alias import, enum, interface, component structure

Neu Google Studio can mot "source of truth" de sinh ung dung moi, thi tai lieu nay chinh la ban mo ta he thong can phai tuan theo.

## 2. Tong quan he thong

`Only One Hub` la mot ung dung quan tri noi bo theo kieu dashboard, duoc xay dung tren `Next.js 16 App Router` va `React 19`, dung `TypeScript` strict, `Ant Design 5` cho component foundation, `Tailwind CSS` cho layout/responsive, `Refine.dev` cho CRUD/data orchestration, `NextAuth` cho authentication, `Zustand` cho state nhe, va `Socket.io` cho realtime updates.

Ung dung duoc to chuc theo mo hinh:

- `App Router shell` o tang route va layout
- `Refine + data provider` o tang data CRUD
- `custom wrapper layer` o tang UI foundation
- `module layer` o tang feature-specific UI
- `service + hook + interface + enum + constant` o tang domain/shared logic
- `context + store` o tang runtime coordination

Kieu ung dung nay khong phai mot marketing website, cung khong phai mot frontend thuong dung fetch tu do trong page. Day la mot admin-style frontend co kien truc co chu y, uu tien tai su dung, mo rong domain theo khu vuc chuc nang, va giu page o dang "mong".

## 3. Cong nghe va tru cot kien truc

Google Studio phai sinh app theo dung nhung tru cot sau:

- Framework: `Next.js 16` voi `App Router`, khong dung `Pages Router`
- UI runtime: `React 19`
- Language: `TypeScript`
- UI foundation: `Ant Design 5`
- Styling layout: `Tailwind CSS`
- Shared component utilities: `DaisyUI` chi dong vai tro phu, khong thay the custom wrappers
- Data management: `@refinedev/core`, `@refinedev/antd`, `@refinedev/nextjs-router`
- Authentication: `NextAuth 4`
- HTTP client: `Axios`
- State management: `Zustand`
- Realtime: `socket.io-client`
- Utilities: `dayjs`, `lodash`, `query-string`

Nhung tru cot nay dan den mot vai quyet dinh kien truc bat buoc:

- moi feature di qua route tree cua App Router
- moi page uu tien compose tu component co san thay vi viet UI thang trong page
- moi CRUD resource uu tien di qua `Refine data provider`
- auth/session di qua `NextAuth` va duoc bridge vao `Refine`
- codebase dung `@/...` alias import thay vi relative import rong
- module nao co nhieu file phai co `index.ts` barrel va uu tien `export * from`

## 4. Nguyen tac kien truc bat buoc

Google Studio phai coi cac nguyen tac sau la non-negotiable:

1. Page phai mong.
   `page.tsx` chu yeu compose hook, module component, va common/custom component. Khong dat business flow dai va UI phan manh truc tiep trong page neu co the tach ra.

2. UI phai di qua wrapper layer truoc.
   Uu tien `@/components/custom`, sau do den `@/components/common`, chi dung `antd` truc tiep khi wrapper chua ton tai va can mo rong layer `custom`.

3. Feature duoc tach theo domain, khong tach theo technical vanity.
   Vi du: `scraping`, `schedule`, `simulation`, `cloud-data`, `google`, `setting`.

4. Shared contract phai tap trung.
   Types o `@/interfaces`, enum o `@/enums`, constants o `@/constants`, hooks o `@/hooks`, services o `@/services`.

5. Responsive la bat buoc.
   UI phai hoat dong tot tren mobile, tablet, desktop; khong duoc generate layout chi dung cho desktop.

6. Text UI phai co kha nang i18n.
   Khi generate code moi, text khong nen hard-code vo toi va. Hay dat san cau truc de route all user-facing text qua i18n layer.

7. Semantic HTML phai duoc uu tien.
   Dung `section`, `nav`, `main`, `header`, `button`, `form` khi phu hop, tranh overuse `div`.

## 5. Cau truc repo muc tieu

Google Studio phai sinh repo theo khung sau:

```text
only-one-fe/
├── docs/
│   └── systems/
├── public/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── (root)/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── common/
│   │   ├── custom/
│   │   ├── layout/
│   │   └── module/
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
│   └── types/
├── Dockerfile
├── eslint.config.mjs
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

Y nghia tung tang:

- `src/app`: route tree, layouts, API routes, shell-level composition
- `src/components/custom`: wrappers quanh Ant Design va reusable UI foundations
- `src/components/common`: reusable component da compose o muc chung
- `src/components/layout`: header, sidebar, tabs, shell navigation, shared chrome
- `src/components/module`: component theo tung feature/domain
- `src/constants`: constants dung chung, navigation map, storage keys, theme config
- `src/contexts`: context cho app shell, theme, socket, refine bootstrapping
- `src/enums`: enums domain va UI mode
- `src/hooks`: custom hooks, nhieu hook la adapter quanh Refine
- `src/interfaces`: contracts TypeScript, namespace-based typing cho domain
- `src/libs`: utility/helper thuần
- `src/providers`: Refine providers, access control provider, data provider
- `src/services`: class-based API services cho special-purpose flows
- `src/stores`: Zustand stores
- `src/styles`: globals va token-linked styling
- `src/types`: type augmentation, nhu `next-auth.d.ts`

## 6. Kien truc route va layout

### 6.1 App Router strategy

Route phai theo `Next.js App Router` va tach thanh hai route group chinh:

- `src/app/(public)`
- `src/app/(root)`

Y nghia:

- `(public)` chua cac route khong can dang nhap, nhu `login`, `register`, `forget-password`
- `(root)` chua shell da dang nhap va tat ca khu vuc quan tri chinh

Trang `src/app/page.tsx` nen dong vai tro redirect entry point, vi du redirect ve `/dashboard`.

### 6.1.1 Route manifest can duoc tai lap

Google Studio nen scaffold it nhat cac route sau de hinh dang app giong source hien tai:

- Public:
    - `/login`
    - `/register`
    - `/forget-password`
- Root landing:
    - `/dashboard`
- Google:
    - `/google/drive/folders`
    - `/google/drive/photos`
    - `/google/keep`
- Scraping:
    - `/scraping/data-providers`
    - `/scraping/provider-items`
    - `/scraping/items`
    - `/scraping/scraping-data`
- Schedule:
    - `/schedule/executions`
    - `/schedule/job-events`
- Simulation:
    - `/simulation/contexts`
    - `/simulation/items`
- Cloud Data:
    - `/cloud-data/providers`
    - `/cloud-data/items`
- Setting:
    - `/setting/users`
    - `/setting/appearance`

### 6.2 Protected app shell

Tat ca route trong `(root)` phai nam duoi mot shared layout de cung dung:

- sidebar
- header
- notification area
- section tabs
- theme context
- auth-aware provider tree
- socket-aware provider tree neu can

Protected shell nen duoc hinh dung theo thu tu trach nhiem sau:

1. app-level provider tai `src/app/layout.tsx`
2. main shell provider cho message/loading/global runtime
3. session-aware refine bootstrap
4. color mode / theme provider
5. private layout chrome nhu sidebar, header, section tabs
6. feature page content

### 6.3 Feature sections trong `(root)`

Google Studio nen sinh cac section theo domain co cau truc giong repo hien tai:

- `dashboard`
- `google`
- `scraping`
- `schedule`
- `simulation`
- `cloud-data`
- `setting`

Moi section co the co `layout.tsx` rieng neu can section tabs, section-specific chrome, hoac nested shell.

### 6.4 Navigation structure

Sidebar la source of truth de bieu dien IA cua app. Cac nhom chuc nang chinh:

- Dashboard
- Google Drive / Google Keep
- Scraping
- Schedule
- Simulation
- Cloud Data
- Setting / User Management / Appearance

Google Studio nen xem sidebar config la noi dinh nghia:

- top-level section
- children pages
- labels
- icons
- section entry href
- page ordering

Khong nen hard-code navigation o nhieu noi. Layout tabs va sidebar nen derive tu metadata chung.

## 7. Module phan he chuc nang

Day la cac domain ma app can giu lai:

### 7.1 Dashboard

- trang tong quan
- bieu do hoac cards thong ke
- widgets hien thi nhanh
- shell landing page sau khi dang nhap

### 7.2 Google

- Google Drive folders
- Google Drive photos
- Google Keep / storage-like views
- co the co luong link tai khoan Google rieng voi auth chinh

### 7.3 Scraping

- data providers
- provider items
- scraped items
- scraping data

Day la khu vuc the hien ro pattern CRUD + filter + table/list + actions.

### 7.4 Schedule

- execution schedules
- job events
- cron-like orchestration views

### 7.5 Simulation

- contexts
- items
- cac page mo phong hoac xu ly du lieu mo phong

### 7.6 Cloud Data

- providers
- items / stored cloud data

### 7.7 Setting

- users
- appearance
- potentially more admin configuration pages

Google Studio khong can generate 100% business logic backend, nhung phai giu dung domain partitioning va route skeleton de co cung hinh dang source.

## 8. Kien truc UI va component layer

### 8.1 Layering

UI duoc to chuc thanh 4 lop:

1. `components/custom`
2. `components/common`
3. `components/layout`
4. `components/module/<feature>`

### 8.2 `components/custom`

Day la lop quan trong nhat de tai lap phong cach code hien tai.

Vai tro:

- wrap Ant Design components
- inject className chung, defaults, theme binding, typing conventions
- dong vai tro "approved design system surface" cua du an

Vi du nhung nhom component can ton tai:

- button
- card
- table
- modal
- input/select/filter
- flex/layout helpers
- config provider / theme wrapper

Google Studio khong nen de page import truc tiep `antd` neu da co wrapper trong `custom`.

### 8.3 `components/common`

Day la lop reusable da duoc compose tu wrappers va utility chung, vi du:

- loading
- status tag
- data table container
- filter panel
- pagination controls
- empty state
- lightbox/media helpers

### 8.4 `components/layout`

Day la lop shell component:

- header
- sidebar
- section tabs
- notification / scroll to top / shell helpers

### 8.5 `components/module/<feature>`

Day la lop UI gan business domain nhat.

Vi du:

- `@/components/module/auth`
- `@/components/module/data-provider`
- `@/components/module/schedule`
- `@/components/module/gallery`
- `@/components/module/google-keep`

Moi feature module phai co barrel rieng va export named symbols.

## 9. Data architecture

### 9.1 Refine la CRUD backbone

He thong hien tai uu tien dung `Refine.dev` de quan ly:

- resource-based CRUD
- table pagination
- sorting
- filtering
- form/modal integration
- mutation workflow

Google Studio phai giu lai mo hinh nay. Khong generate app theo kieu moi page tu goi `fetch()` rieng le neu resource do da phu hop voi `Refine`.

### 9.2 Data provider strategy

`src/providers/data-provider.ts` dong vai tro adapter tu `Refine DataProvider` sang REST backend.

Trach nhiem cua data provider:

- map filters thanh query format backend yeu cau
- map sorters thanh query string
- map pagination thanh `page`, `limit`, `sortBy`
- attach session token vao request
- normalize error thanh shape hop le cho Refine

Generator nen xem query contract mong muon la:

- pagination qua `page` va `limit`
- sort qua danh sach `field:ORDER`
- filter qua `filter.<field>=<operator>:<value>`
- cho phep `search` hoac `q` cho quick search khi phu hop

### 9.3 Service layer strategy

Ben canh data provider, app van can `class-based services` trong `src/services`.

Service layer dung cho:

- auth
- refresh token
- special-purpose endpoint
- flows khong map dep vao CRUD resource

Kien truc dung la:

- CRUD page -> uu tien `Refine` + hook wrappers
- special action -> service class / custom hook

### 9.4 Hook adapter strategy

Nhieu hook trong repo la adapter quanh Refine. Google Studio nen sinh cac hook pattern sau:

- `useTableContainer`
- `useCustomModal`
- `useCustomData`
- `useCustomDelete`
- `useCustomSelect`

Y nghia:

- page khong phai biet qua nhieu chi tiet Refine
- config phuc tap duoc dua vao hook dung chung
- list page co UX va behavior dong nhat

## 10. Authentication va session flow

### 10.1 Auth backbone

Authentication backbone cua frontend la `NextAuth` voi `CredentialsProvider`.

Flow chuan:

1. nguoi dung login tren route public
2. `NextAuth` goi `authService.login(...)`
3. backend tra `accessToken` + `refreshToken`
4. frontend decode payload de tao user info session
5. token duoc luu trong JWT session
6. khi token het han, frontend refresh thong qua `authService.refreshToken(...)`

### 10.2 Refine auth bridge

Sau khi co session, `RefineContext` se bridge session sang `Refine authProvider` va `dataProvider`.

Dieu nay cho phep:

- protected routes co check auth
- request CRUD gui kem bearer token
- logout / unauthorized handling dong nhat

Provider tree duoc khuyen nghi scaffold theo tinh than repo hien tai:

```text
app/layout.tsx
-> MainProvider
-> RefineContext
   -> SessionProvider
   -> ColorModeContextProvider
   -> Refine
      -> routerProvider
      -> authProvider
      -> accessControlProvider
      -> notificationProvider
      -> dataProvider
-> Protected route layout
-> Section layout
-> Page
```

### 10.3 Redirect behavior

Google Studio phai giu dung nhung quy tac sau:

- authenticated user vao public auth page -> redirect sang dashboard
- unauthenticated user vao protected page -> redirect sang login
- neu session het han trong protected app -> sign out va quay ve login
- luu `return_url` de co the quay lai page dang xem sau dang nhap

### 10.4 Google account integration

Ngoai auth chinh, app con co integration voi Google APIs. Day nen duoc scaffold thanh mot luong lien ket tai khoan/authorization rieng, khong tron lan voi core login flow.

## 11. State, context, va runtime coordination

App khong nen dua tat ca state vao mot noi. Hay chia trach nhiem:

### 11.1 Contexts

Dung cho runtime coordination va shell-wide behavior:

- `MainContext`: loading, message, notification, shell-level actions
- `RefineContext`: bootstrap auth + refine + session bridge
- `SocketContext`: realtime connection cho private area
- theme-related contexts: color mode, palette, config provider coordination

Neu co access control provider, hay scaffold san interface va diem gan vao `Refine`, nhung co the de implementation o muc permissive ban dau de phu hop hien trang source.

### 11.2 Zustand stores

Dung cho shared state nhe, co xu huong UI-global:

- breakpoint
- theme mode
- shell preference nho

### 11.3 Local state

State cuc bo o page/module van duoc khuyen dung cho:

- modal open/close
- selected row ids
- local display mode
- active tab/index

Khong dua state cuc bo len global store neu khong can.

## 12. Pattern cho page list/detail/form

Google Studio nen tai lap dung pattern page pho bien trong repo:

### 12.1 List page pattern

Mot list page thuong gom:

- `useTableContainer` de tao table state
- cac `useSelect...` hooks de load filter options
- `useCustomDelete` cho destructive action
- `useCustomModal` cho edit/create modal
- `DataTableContainer` de hien thi table/list shell
- action buttons o dau trang
- filter items duoc mo ta bang metadata

Page list phai ho tro:

- server-side pagination
- filter
- sorter
- row actions
- responsive table/list presentation
- batch action khi phu hop

### 12.2 Form modal pattern

Neu feature co CRUD edit/create:

- mo form bang custom modal hook
- data submit di qua Refine mutation hoac service wrapper
- success thi refresh table query
- error thi show message thong nhat

### 12.3 Display mode pattern

Neu page co media/grid/list:

- display mode la enum
- filter/layout controls dat trong filter/action area
- reuse lightbox/gallery component khi can

## 13. Styling, theming, va responsive behavior

### 13.1 Styling strategy

Phai ket hop:

- `Ant Design` cho base component
- `Tailwind CSS` cho spacing, layout, responsive utilities
- CSS variables / theme tokens de dong bo theme

Khong uu tien viet plain CSS rieng le neu co the giai quyet bang Tailwind va wrapper composition.

### 13.2 Theme strategy

Nen co mot custom config provider de map Ant Design tokens voi palette/theme cua app. Theme logic khong nen rai rac tung page.

### 13.3 Responsive strategy

Tat ca page va reusable component phai tu dong ho tro:

- mobile
- tablet
- desktop

Can tranh:

- table overflow khong kiem soat
- action bar vo bo cuc tren mobile
- sidebar chi hoat dong desktop

Nen dung:

- flexible stack layout
- responsive breakpoints
- alternate display modes khi du lieu qua rong

## 14. Type system, naming, va export conventions

Google Studio phai tao code theo dung conventions sau:

### 14.1 Alias import

Uu tien `@/...` imports.

Dung:

- `@/components/custom`
- `@/components/common`
- `@/hooks`
- `@/services`
- `@/interfaces`
- `@/constants`
- `@/enums`

Khong import sau vao file con neu folder da co barrel goc.

### 14.2 Barrel exports

Moi folder shared/module quan trong phai co `index.ts`.

Quy tac:

- uu tien `export * from './Xxx'`
- consumer import tu barrel
- khong deep import vao child file khi da co barrel

### 14.3 Component exports

Child component nen dung named export.

App Router `page.tsx` va `layout.tsx` co the default export theo convention cua Next.js.

### 14.4 Types

Nen co:

- interface/type ro rang cho props
- explicit request/response types cho API interactions
- enum cho domain constant thay vi union literal khi phu hop
- standardized empty list checks voi `!list?.length`

### 14.5 Component structure

Trong `.tsx`, uu tien thu tu:

- constants
- state
- memos
- effects
- callbacks
- JSX

Neu component qua lon, phai tach theo subcomponent co trach nhiem ro.

## 15. API boundary va infrastructure edge

Google Studio phai scaffold dung cac diem bien he thong:

- `src/app/api/auth/[...nextauth]/route.ts` cho auth route handler
- `src/app/api/health/route.ts` cho health check
- `src/app/api/proxy-image/route.ts` neu can proxy remote image/media
- `next.config.mjs` co rewrite phu hop cho backend REST

Frontend khong nen coi local API routes la backend business chinh. Chuc nang chinh van o external API server va frontend goi qua `NEXT_PUBLIC_API_URL`.

## 16. Bien moi truong va runtime config

Google Studio nen scaffold nhung env sau:

- `NEXT_PUBLIC_API_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SOCKET_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- cac `NEXT_PUBLIC_FIREBASE_*` neu van giu integration layer
- `PORT`

Luu y:

- chi bien client moi duoc prefix `NEXT_PUBLIC_`
- khong hard-code secrets
- phai cho phep runtime config trong Docker/prod deployment

## 17. Blueprint de generate feature moi

Khi generate mot feature section moi, Google Studio nen theo template:

```text
src/app/(root)/<feature>/
├── layout.tsx
├── <resource-a>/
│   └── page.tsx
├── <resource-b>/
│   └── page.tsx

src/components/module/<feature>/
├── index.ts
├── <FeaturePrimaryView>.tsx
├── <FeatureFormModal>.tsx
└── <FeatureHelper>.tsx

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
└── <feature>.service.ts
```

Khong phai feature nao cung can day du moi file tren, nhung generator nen bat dau tu khung nay roi loai bo phan khong can thay vi tron tat ca logic vao page.

## 18. Generator instructions cho Google Studio

Day la tap luat ma Google Studio phai tuan thu khi sinh app:

1. Tao du an `Next.js App Router + TypeScript`.
2. Dat toan bo source app trong `src/`.
3. Tao route groups `(public)` va `(root)`.
4. Tao app shell protected voi sidebar, header, va section-aware layouts.
5. Tao layer `components/custom` lam wrapper chinh cho Ant Design.
6. Tao `components/common` cho reusable composed widgets.
7. Tao `components/module/<feature>` cho UI theo domain.
8. Tao `providers/data-provider.ts` de Refine CRUD goi REST backend qua Axios.
9. Tao `contexts/RefineContext.tsx` de bridge `NextAuth`, `Refine`, router provider, va data provider.
10. Tao `services/auth.service.ts` va auth API route handler cho login/refresh flow.
11. Tao `interfaces`, `enums`, `constants`, `hooks`, `stores`, `libs` thanh cac tang rieng biet.
12. Dung alias import `@/...` va barrel export `index.ts`.
13. Uu tien named export cho component va module files.
14. Dam bao responsive tren mobile, tablet, desktop.
15. Dung semantic HTML phu hop.
16. Gan text UI vao i18n-ready layer.
17. Khong deep import vao child files neu da co barrel.
18. Khong dat business logic CRUD dai trong `page.tsx`.
19. Khong bo qua custom wrapper layer de dung `antd` truc tiep mot cach tuy tien.
20. Khong generate plain CSS neu Tailwind va wrapper co the giai quyet.

## 19. Nhung dieu khong duoc generate sai

Google Studio can tranh cac sai lech sau:

- tao `pages/` router
- gom het tat ca component vao `components/` ma khong chia `custom/common/layout/module`
- de tung page tu fetch REST bang cach rieng
- import `antd` truc tiep khap noi
- bo qua `Refine` cho nhung resource CRUD chuan
- khong co barrel files
- dung deep relative imports dai
- hard-code navigation o nhieu file
- khong co provider tree cho auth/theme/refine
- bo qua responsive handling
- bo qua phan route public/protected separation

## 20. Tieu chi thanh cong cho output duoc generate

Ban generate duoc xem la dat yeu cau neu:

- nhin vao cau truc folder co the nhan ra day la mot repo cung phong cach voi `only-one-fe`
- route tree khop voi app dashboard protected/public hien tai
- co day du shared layers va naming conventions
- list pages co pattern CRUD/filter/table/action giong nhau
- auth flow, provider tree, va data provider duoc scaffolding dung cho viec mo rong tiep
- UI foundation thong nhat va khong bi "copy-paste page by page"
- co the tiep tuc phat trien them feature ma khong can refactor lai toan bo structure

## 21. Ket luan

He thong frontend hien tai cua `Only One Hub` la mot dashboard app duoc to chuc theo huong modular, domain-driven o muc frontend, voi Refine lam CRUD backbone, NextAuth lam auth backbone, Ant Design wrappers lam UI foundation, va App Router lam shell navigation backbone.

Neu Google Studio tai lap dung:

- route groups
- shared layers
- custom wrappers
- Refine data flow
- auth/session bridge
- naming/export conventions
- responsive admin-shell behavior

thi output sinh ra se co hinh dang, cach mo rong, va chat kien truc rat gan voi source hien tai.
