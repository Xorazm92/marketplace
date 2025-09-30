#!/bin/bash

echo "🛑 INBOLA Backend to'xtatish..."

# 1. Port 4000 dagi jarayonlar
echo "🔍 Port 4000 ni tekshirish..."
PID=$(lsof -ti:4000 2>/dev/null)
if [ ! -z "$PID" ]; then
    echo "⚠️  Port 4000 dagi jarayon topildi (PID: $PID)"
    kill -9 $PID 2>/dev/null
    echo "✅ To'xtatildi"
else
    echo "✅ Port 4000 bo'sh"
fi

# 2. Barcha NestJS jarayonlar
echo ""
echo "🔍 NestJS jarayonlarni qidirish..."
NEST_PIDS=$(pgrep -f "nest start" 2>/dev/null)
if [ ! -z "$NEST_PIDS" ]; then
    echo "⚠️  NestJS jarayonlar topildi:"
    echo "$NEST_PIDS"
    pkill -9 -f "nest start" 2>/dev/null
    echo "✅ To'xtatildi"
else
    echo "✅ NestJS jarayonlar yo'q"
fi

# 3. ts-node jarayonlar
echo ""
echo "🔍 ts-node jarayonlarni qidirish..."
TS_PIDS=$(pgrep -f "ts-node" 2>/dev/null)
if [ ! -z "$TS_PIDS" ]; then
    echo "⚠️  ts-node jarayonlar topildi:"
    echo "$TS_PIDS"
    pkill -9 -f "ts-node" 2>/dev/null
    echo "✅ To'xtatildi"
else
    echo "✅ ts-node jarayonlar yo'q"
fi

# 4. Port 4001-4005 ni ham tekshirish
echo ""
echo "🔍 Boshqa portlarni tekshirish..."
for PORT in 4001 4002 4003 4004 4005; do
    PID=$(lsof -ti:$PORT 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "⚠️  Port $PORT band (PID: $PID) - to'xtatilmoqda..."
        kill -9 $PID 2>/dev/null
    fi
done

echo ""
echo "✅ ============================================"
echo "✅ Barcha backend jarayonlar to'xtatildi!"
echo "✅ ============================================"

# 5. Yakuniy tekshiruv
sleep 1
echo ""
echo "📊 Yakuniy holat:"
echo "Port 4000: $(lsof -ti:4000 2>/dev/null || echo '✅ Bo'\''sh')"
echo "Node jarayonlar: $(pgrep -f node | wc -l) ta"
