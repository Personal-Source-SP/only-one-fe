# Only One Hub

Ứng dụng quản lý dữ liệu và tích hợp đa nền tảng, cung cấp các tính năng quản lý Google Drive, web scraping, lập lịch tự động, mô phỏng và quản lý dữ liệu đám mây.

## 📋 Mục lục

- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Phát triển](#phát-triển)
- [Build và Deploy](#build-và-deploy)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Tài liệu](#tài-liệu)

## ✨ Tính năng

### 🔐 Xác thực và Bảo mật

- Đăng nhập/Đăng ký với NextAuth
- Tích hợp Firebase Authentication
- Quản lý quyền truy cập theo vai trò
- Bảo vệ route với navigation guard

### 📁 Google Drive Integration

- Quản lý thư mục và file từ Google Drive
- Xem và quản lý ảnh từ Google Drive
- Đồng bộ dữ liệu với Google Keep
- Tích hợp Google APIs

### 🕷️ Web Scraping

- Quản lý nhà cung cấp dữ liệu
- Cấu hình đối tượng scraping
- Xem và quản lý dữ liệu đã cào
- Xử lý dữ liệu scraping tự động

### ⏰ Lập lịch (Scheduling)

- Tạo và quản lý lịch biểu thực thi
- Theo dõi sự kiện lịch biểu
- Hỗ trợ cron expressions
- Xem lịch chạy tiếp theo

### 🌐 Mô phỏng (Simulation)

- Quản lý danh sách ngữ cảnh
- Tạo và quản lý các mô phỏng
- Xử lý dữ liệu mô phỏng

### ☁️ Cloud Data

- Quản lý nhà cung cấp dữ liệu đám mây
- Xem và quản lý dữ liệu cloud
- Đồng bộ dữ liệu từ nhiều nguồn

### 📊 Dashboard

- Tổng quan thống kê
- Biểu đồ hoạt động
- Biểu đồ lưu trữ
- Thông tin real-time

### 👥 Quản lý người dùng

- Quản lý danh sách người dùng
- Phân quyền theo vai trò
- Cài đặt hệ thống

### 🔄 Real-time Updates

- Tích hợp Socket.io cho cập nhật real-time
- Thông báo real-time
- Đồng bộ dữ liệu tự động

## 🛠️ Công nghệ sử dụng

### Frontend Framework

- **Next.js 16** - React framework với App Router
- **React 19** - UI library
- **TypeScript** - Type safety

### UI/UX Libraries

- **Ant Design 5** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library cho Tailwind
- **Iconify** - Icon library

### State Management & Data Fetching

- **Zustand** - State management
- **Refine.dev** - Data management framework
- **React Query** (qua Refine) - Data fetching

### Authentication & Backend Services

- **NextAuth 4** - Authentication
- **Firebase 10** - Authentication, Firestore, Storage
- **Axios** - HTTP client

### Development Tools

- **Monaco Editor** - Code editor component
- **Socket.io Client** - Real-time communication
- **Recharts** - Chart library
- **Day.js** - Date manipulation
- **Lodash** - Utility functions

### Code Quality

- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

### Deployment

- **Docker** - Containerization
- **Next.js Standalone** - Optimized production build

## 💻 Yêu cầu hệ thống

- **Node.js**: >= 20.x
- **npm**: >= 9.x hoặc **yarn** hoặc **pnpm**
- **Firebase Project** (cho Authentication, Firestore, Storage)
- **Google Cloud Project** (cho Google APIs integration)

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd only-one-fe
```

### 2. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### 3. Cấu hình môi trường

Tạo file `.env.local` từ `.env.sample` và điền các thông tin cần thiết:

```bash
cp .env.sample .env.local
```

Xem chi tiết trong phần [Cấu hình](#cấu-hình).

## ⚙️ Cấu hình

### Environment Variables

Tạo file `.env.local` với các biến môi trường sau:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# API Configuration
NEXT_PUBLIC_API_URL=your_api_url

# Google APIs
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Socket.io
NEXT_PUBLIC_SOCKET_URL=your_socket_url

# Port (optional, default: 3000)
PORT=3000
```

### Firebase Setup

Xem hướng dẫn chi tiết trong [docs/FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md)

## 💻 Phát triển

### Chạy development server

```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

### Linting

```bash
# Kiểm tra lỗi
npm run lint

# Tự động sửa lỗi
npm run lint:fix
```

### Format code

```bash
npm run prettier
```

### Cấu trúc Component

Theo quy tắc của dự án, các component React được tổ chức theo thứ tự:

1. **State** - Khai báo state
2. **Use Effect** - Side effects
3. **Use Memo** - Memoized values
4. **Use Callback** - Memoized callbacks
5. **TSX** - Render JSX

Component format:

```typescript
const Component: FC<TypeProps> = () => {
    // State
    // Use Effect
    // Use Memo
    // Use Callback
    // TSX
};

export default memo(Component);
```

## 🏗️ Build và Deploy

### Build production

```bash
npm run build
```

### Chạy production server

```bash
npm run start
# hoặc với port tùy chỉnh
PORT=4000 npm run start
```

### Docker Deployment

#### Build Docker image

```bash
docker build -t only-one-hub .
```

#### Chạy container

```bash
docker run -p 4000:4000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=your_key \
  -e NEXTAUTH_SECRET=your_secret \
  # ... các biến môi trường khác
  only-one-hub
```

#### Docker Compose

Tạo file `docker-compose.yml`:

```yaml
version: '3.8'
services:
    app:
        build: .
        ports:
            - '4000:4000'
        environment:
            - NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
            - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
            # ... các biến môi trường khác
        healthcheck:
            test:
                [
                    'CMD',
                    'node',
                    '-e',
                    "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})",
                ]
            interval: 30s
            timeout: 5s
            retries: 3
```

Chạy:

```bash
docker-compose up -d
```

## 📁 Cấu trúc dự án

```
only-one-fe/
├── public/                 # Static files
│   ├── assets/            # Assets (images, logos)
│   ├── data/              # Static data files
│   └── images/            # Image resources
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (public)/      # Public routes (login, register)
│   │   ├── (root)/        # Protected routes
│   │   │   ├── dashboard/ # Dashboard page
│   │   │   ├── google/    # Google integration pages
│   │   │   ├── scraping/  # Web scraping pages
│   │   │   ├── schedule/  # Scheduling pages
│   │   │   ├── simulation/# Simulation pages
│   │   │   ├── cloud-data/# Cloud data pages
│   │   │   └── setting/   # Settings pages
│   │   └── api/           # API routes
│   ├── components/        # React components
│   │   ├── common/        # Common components
│   │   ├── custom/        # Custom components
│   │   ├── layout/        # Layout components
│   │   └── module/        # Feature modules
│   ├── constants/         # Constants
│   ├── contexts/          # React contexts
│   ├── enums/             # TypeScript enums
│   ├── hooks/             # Custom React hooks
│   ├── interfaces/        # TypeScript interfaces
│   ├── libs/              # Utility libraries
│   ├── providers/         # Data providers
│   ├── services/          # API services
│   ├── stores/            # Zustand stores
│   ├── styles/            # Global styles
│   └── types/             # TypeScript types
├── docs/                  # Documentation
├── docker/                # Docker scripts
├── .eslintrc.json         # ESLint config
├── .prettierrc            # Prettier config
├── next.config.mjs        # Next.js config
├── tailwind.config.ts     # Tailwind config
├── tsconfig.json          # TypeScript config
├── Dockerfile             # Docker configuration
└── package.json           # Dependencies
```

## 📚 Tài liệu

- [Firebase Setup Guide](./docs/FIREBASE_SETUP.md) - Hướng dẫn cấu hình Firebase
- [Next.js Documentation](https://nextjs.org/docs)
- [Ant Design Documentation](https://ant.design/docs/react/introduce)
- [Refine.dev Documentation](https://refine.dev/docs)

## 🔧 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run start` - Chạy production server
- `npm run lint` - Kiểm tra linting
- `npm run lint:fix` - Tự động sửa lỗi linting
- `npm run prettier` - Format code với Prettier

## 📝 License

Private project

## 👥 Contributors

Xem danh sách contributors trong repository.

---

**Lưu ý**: Đảm bảo đã cấu hình đầy đủ các biến môi trường và Firebase trước khi chạy ứng dụng.
