#!/bin/bash

echo "🔍 Port 4000 holatini tekshirish..."

# 1. Hozirgi holatni ko'rish
PORT=4000
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
    echo "✅ Port $PORT bo'sh"
else
    echo "⚠️  Port $PORT band! PID: $PID"
    echo "📋 Jarayon ma'lumotlari:"
    ps aux | grep $PID | grep -v grep
    
    echo ""
    read -p "🛑 Jarayonni to'xtatish kerakmi? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔥 Jarayonni to'xtatish..."
        kill -9 $PID 2>/dev/null
        sleep 2
        
        # Tekshirish
        NEW_PID=$(lsof -ti:$PORT 2>/dev/null)
        if [ -z "$NEW_PID" ]; then
            echo "✅ Port $PORT endi bo'sh!"
        else
            echo "❌ Xato: Port hali ham band"
            exit 1
        fi
    else
        echo "❌ Jarayon to'xtatilmadi. Boshqa port ishlatishni ko'rib ko'ring."
        exit 1
    fi
fi

# 2. Barcha Node jarayonlarini tekshirish
echo ""
echo "🔍 Barcha Node.js jarayonlari:"
ps aux | grep node | grep -v grep

# 3. PM2 jarayonlarini tekshirish
if command -v pm2 &> /dev/null; then
    echo ""
    echo "📦 PM2 jarayonlari:"
    pm2 list 2>/dev/null || echo "PM2 jarayonlari yo'q"
fi

echo ""
echo "✅ Tekshiruv tugadi!"
