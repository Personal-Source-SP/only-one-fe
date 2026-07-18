# ==========================================
# Stage 1: Base
# Cài đặt tất cả tools cần thiết
# ==========================================
FROM public.ecr.aws/docker/library/node:20-alpine AS base

RUN apk add --no-cache \
    libc6-compat \
    gettext \
    dumb-init \
    && rm -rf /var/cache/apk/*

WORKDIR /app
RUN chown -R node:node /app

# ==========================================
# Stage 2: Builder
# Cài dependencies và build ứng dụng
# ==========================================
FROM base AS builder
# WORKDIR /app được kế thừa từ base, không cần khai báo lại
USER node

# Tách COPY package*.json riêng để tận dụng Docker layer cache:
# Chỉ khi package.json thay đổi mới cần chạy lại npm ci
COPY --chown=node:node package*.json ./

# BuildKit cache mount: tái sử dụng npm cache giữa các lần build,
# giúp tăng tốc đáng kể khi dependencies không thay đổi
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps
# TODO: Điều tra và giải quyết peer dependency conflicts để bỏ --legacy-peer-deps.
# Flag này có thể ẩn xung đột version dẫn đến cài package có lỗ hổng bảo mật đã biết.

# ENV đặt trước COPY . . để các giá trị này có hiệu lực ngay khi npm run build chạy
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --chown=node:node . .

# Build-time env injection: Tạo .env.local từ .env.sample để next build có thể đọc.
# Khác với runtime (entrypoint.sh) tạo .env để next server đọc khi khởi động.
RUN if [ -f .env.sample ]; then \
        envsubst < .env.sample > .env.local; \
    fi

# Gộp các bước build thành một RUN để giảm số layer Docker
RUN npm run build && \
    rm -f .env.local

# ==========================================
# Stage 3: Runner (Production)
# Image cuối cùng - chỉ chứa những gì cần thiết
# ==========================================
FROM base AS runner
WORKDIR /app
USER node

ENV NODE_ENV=production
# NEXT_TELEMETRY_DISABLED chỉ cần ở build-time (builder stage), không cần ở runtime
ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

# Sửa path: thêm leading slash /app để đảm bảo copy đúng đường dẫn tuyệt đối từ builder
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

COPY --chown=node:node package.json ./
COPY --chown=node:node .env.sample ./
COPY --chown=node:node ./docker/entrypoint.sh ./

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start application
RUN sed -i 's/\r$//' ./entrypoint.sh && \
    chmod +x ./entrypoint.sh && \
    chown node:node ./entrypoint.sh

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/bin/sh", "entrypoint.sh"]
