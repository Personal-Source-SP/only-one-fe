#!/bin/sh
set -e  # Exit ngay khi có lỗi

echo "=========================================="
echo "Starting Next.js Application"
echo "=========================================="

# Runtime env injection: Tạo .env từ .env.sample bằng cách substitute các biến
# môi trường của container vào template. Khác với build-time (Dockerfile) tạo .env.local
# để next build có thể đọc, đây là runtime để next server đọc khi khởi động.
if [ -f .env.sample ]; then
    echo "📝 Creating .env from template..."
    envsubst < .env.sample > .env
    echo "✅ Environment file created"
fi

# Set default values nếu chưa được set
export PORT=${PORT:-4000}
export NODE_ENV=${NODE_ENV:-production}
export HOSTNAME=${HOSTNAME:-0.0.0.0}

# Log thông tin startup
echo "=========================================="
echo "🚀 Configuration:"
echo "   Environment: ${NODE_ENV}"
echo "   Port:        ${PORT}"
echo "   Hostname:    ${HOSTNAME}"
echo "=========================================="

echo "🔧 Environment variables (keys only):"
printenv | cut -d= -f1 | while read -r name; do
    echo "   $name"
done
echo "=========================================="

# Start Next.js server
echo "🎯 Starting Next.js server..."
exec node server.js