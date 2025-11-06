#!/bin/sh
set -e  # Exit ngay khi có lỗi

echo "=========================================="
echo "Starting Next.js Application"
echo "=========================================="

# Load environment variables từ file nếu tồn tại
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

# Start Next.js server
echo "🎯 Starting Next.js server..."
exec node server.js