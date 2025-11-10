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
WORKDIR /app
USER node

COPY --chown=node:node package*.json ./
RUN npm ci --legacy-peer-deps

COPY --chown=node:node . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN if [ -f .env.sample ]; then \
        envsubst < .env.sample > .env.local; \
    fi

RUN npm run build
RUN npm run clean:cache || true
RUN rm -f .env.local

# ==========================================
# Stage 3: Runner (Production)
# Image cuối cùng - chỉ chứa những gì cần thiết
# ==========================================
FROM base AS runner
WORKDIR /app
USER node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=node:node app/.next/standalone ./
COPY --from=builder --chown=node:node app/.next/static ./.next/static
COPY --from=builder --chown=node:node app/public ./public

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
