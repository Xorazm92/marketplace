
#!/bin/bash
set -e

echo "=== STEP 1: Dependencies ni tozalash va qayta o'rnatish ==="
cd front-main
rm -rf node_modules package-lock.json .next
npm install

echo "=== STEP 2: Pages va App router tekshirish ==="
APP_COUNT=0
PAGES_COUNT=0

if [ -d "app" ]; then
  APP_COUNT=$(find app -type f | wc -l)
fi

if [ -d "pages" ]; then
  PAGES_COUNT=$(find pages -type f | wc -l)
fi

echo "App directory fayllar soni: $APP_COUNT"
echo "Pages directory fayllar soni: $PAGES_COUNT"

if [ "$APP_COUNT" -gt 0 ] && [ "$PAGES_COUNT" -gt 0 ]; then
  echo "⚠️  App va Pages router ikkalasi ham bor. Pages ni vaqtincha o'chirib tashlaymiz..."
  mv pages pages.disabled.$(date +%s)
fi

echo "=== STEP 3: tsconfig.json va next.config.js ichida aliaslarni tekshirish ==="
echo "--- tsconfig.json paths ---"
grep -A 10 '"paths"' tsconfig.json || echo "Hech narsa topilmadi (tsconfig paths yo'q)"

echo "--- next.config.js ---"
grep -A 5 "webpack\|alias" next.config.js || echo "Hech narsa topilmadi (next.config alias yo'q)"

echo "=== STEP 4: next.config.js syntaxini validatsiya qilish ==="
node -e "require('./next.config.js'); console.log('✅ next.config.js valid');" || {
  echo "❌ next.config.js da xato bor, uni tekshiring."
  exit 1
}

echo "=== STEP 5: Build qilib test qilish ==="
npm run build || {
  echo "❌ Build muvaffaqiyatsiz. Stack trace ni yuqoridan ko'ring."
  exit 1
}

echo "=== STEP 6: Dev serverni ishga tushirish ==="
npm run dev
