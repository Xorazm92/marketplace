#!/usr/bin/env bash
# Prod deploy: zaxira → build → migratsiya → ishga tushirish → tekshirish.
#   bash scripts/deploy.sh
# Muvaffaqiyatsiz bo'lsa: kod `git checkout <oldingi-commit>` bilan qaytariladi va
# skript qayta ishga tushiriladi; migratsiya faqat oldinga yuradi (docs/DEPLOYMENT.md, Rollback).
set -euo pipefail
cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"
[ -f .env.prod ] || { echo "XATO: .env.prod yo'q (namuna: .env.prod.example)" >&2; exit 1; }

echo "== 1/5 Zaxira"
if $COMPOSE ps --status running postgres | grep -q postgres; then
  bash scripts/backup.sh
else
  echo "postgres ishlamayapti — birinchi deploy, zaxira o'tkazib yuborildi"
fi

echo "== 2/5 Build ($(git rev-parse --short HEAD))"
$COMPOSE build backend web

echo "== 3/5 Migratsiya"
$COMPOSE up -d postgres
$COMPOSE run --rm backend npx prisma migrate deploy

echo "== 4/5 Ishga tushirish"
$COMPOSE up -d backend web nginx

echo "== 5/5 Tekshirish"
for i in $(seq 1 30); do
  if $COMPOSE exec -T backend node -e "fetch('http://127.0.0.1:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    echo "Tayyor: backend sog'lom"
    $COMPOSE ps
    exit 0
  fi
  sleep 2
done
echo "XATO: backend 60 soniyada sog'lom holatga kelmadi. Log: $COMPOSE logs --tail=100 backend" >&2
exit 1
