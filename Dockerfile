# ==========================================
# Stage 0: Base
# Cài đặt tất cả tools cần thiết CHỈ MỘT LẦN
# ==========================================
FROM public.ecr.aws/docker/library/node:20-alpine AS base

# Cài các công cụ cần thiết cho TẤT CẢ stages
RUN apk add --no-cache \
    libc6-compat \
    gettext \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Tạo user non-root ngay từ đầu
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

# ==========================================
# Stage 1: Dependencies
# Cài đặt ALL dependencies (bao gồm dev)
# ==========================================
FROM base AS dependencies

USER nextjs

# Copy package files
COPY --chown=nextjs:nodejs package*.json ./

# Cài tất cả dependencies (cần devDependencies để build)
RUN npm ci --legacy-peer-deps

# ==========================================
# Stage 2: Build
# Build ứng dụng Next.js
# ==========================================
FROM base AS build

USER nextjs

# Copy node_modules từ stage dependencies
COPY --from=dependencies --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy toàn bộ source code
COPY --chown=nextjs:nodejs . .

# Set build environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tạo .env.local từ template nếu cần cho build
RUN if [ -f .env.sample ]; then \
        envsubst < .env.sample > .env.local; \
    fi

# Build Next.js
RUN npm run build

# Clean cache
RUN npm run clean:cache || true

# Xóa .env.local sau khi build (bảo mật)
RUN rm -f .env.local

# ==========================================
# Stage 3: Production Dependencies
# Cài lại CHỈ production dependencies
# ==========================================
FROM base AS prod-deps

USER nextjs

COPY --chown=nextjs:nodejs package*.json ./

# Chỉ cài production dependencies
RUN npm ci --legacy-peer-deps --omit=dev && \
    npm cache clean --force

# ==========================================
# Stage 4: Runner (Final Production Image)
# Image cuối cùng - nhẹ nhất, an toàn nhất
# ==========================================
FROM base AS runner

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

USER nextjs

# Copy Next.js production build
# Next.js standalone output đã bao gồm tất cả cần thiết
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public folder (static assets)
COPY --from=build --chown=nextjs:nodejs /app/public ./public

# Copy production dependencies (nếu standalone không include đủ)
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy các file cấu hình cần thiết
COPY --chown=nextjs:nodejs package.json ./
COPY --chown=nextjs:nodejs .env.sample ./

# Copy và set permission cho entrypoint script
COPY --chown=nextjs:nodejs docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Expose port
EXPOSE 4000

# Health check để Docker/K8s monitor container
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Sử dụng dumb-init để handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start application
CMD ["/bin/sh", "/app/entrypoint.sh"]