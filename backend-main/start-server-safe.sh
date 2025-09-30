#!/bin/bash

echo "🚀 INBOLA Backend xavfsiz ishga tushirish..."

PORT=${1:-4000}

# 1. Portni tozalash
echo "🧹 Port $PORT ni tozalash..."
PID=$(lsof -ti:$PORT 2>/dev/null)
if [ ! -z "$PID" ]; then
    echo "⚠️  Port band, tozalanmoqda... (PID: $PID)"
    kill -9 $PID 2>/dev/null
    sleep 2
fi

# 2. Barcha eski nest jarayonlarni to'xtatish
echo "🛑 Eski NestJS jarayonlarni to'xtatish..."
pkill -f "nest start" 2>/dev/null || true
pkill -f "ts-node" 2>/dev/null || true
sleep 1

# 3. Port bo'shligini tekshirish
PID=$(lsof -ti:$PORT 2>/dev/null)
if [ ! -z "$PID" ]; then
    echo "❌ Port hali ham band! Boshqa portni ishlatishni tavsiya qilaman."
    echo "   Masalan: ./start-server-safe.sh 4001"
    exit 1
fi

echo "✅ Port $PORT bo'sh!"

# 4. Environment variable sozlash
export PORT=$PORT

# 5. Serverni ishga tushirish
echo "🚀 Server ishga tushmoqda (port $PORT)..."
echo "📋 Log: server-$PORT.log"
echo ""

npm run start:dev 2>&1 | tee server-$PORT.log &
SERVER_PID=$!

# 6. Server ishga tushishini kutish
echo "⏳ Server ishga tushishi kutilmoqda..."
sleep 5

# 7. Tekshirish
if ps -p $SERVER_PID > /dev/null; then
    echo ""
    echo "✅ ============================================"
    echo "✅ Server muvaffaqiyatli ishga tushdi!"
    echo "✅ ============================================"
    echo ""
    echo "🌐 URLs:"
    echo "   - API: http://localhost:$PORT"
    echo "   - Docs: http://localhost:$PORT/api-docs"
    echo "   - Health: http://localhost:$PORT/health"
    echo ""
    echo "📝 Process ID: $SERVER_PID"
    echo "📋 Log file: server-$PORT.log"
    echo ""
    echo "🛑 To'xtatish: kill $SERVER_PID"
    echo "   yoki: pkill -f 'nest start'"
else
    echo ""
    echo "❌ Server ishga tushmadi!"
    echo "📋 Logni tekshiring: cat server-$PORT.log"
    exit 1
fi
