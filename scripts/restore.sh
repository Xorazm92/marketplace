#!/usr/bin/env bash
# Zaxiradan tiklash. BAZADAGI JORIY MA'LUMOT O'CHADI — faqat ongli ravishda.
#   bash scripts/restore.sh backups/20260929-033000
set -euo pipefail
cd "$(dirname "$0")/.."
dir="${1:?Zaxira papkasini bering: backups/YYYYmmdd-HHMMSS}"
[ -s "$dir/db.dump" ] || { echo "XATO: $dir/db.dump topilmadi" >&2; exit 1; }

read -r -p "Joriy baza va rasmlar $dir bilan almashtiriladi. Davom etish uchun 'tiklash' deb yozing: " answer
[ "$answer" = "tiklash" ] || { echo "Bekor qilindi"; exit 1; }

# Standart: .env.prod va docker-compose.prod.yml. Sinov uchun (staging, lokal) almashtirish mumkin:
#   ENV_FILE=/yo'l/env COMPOSE_OVERRIDE=/yo'l/override.yml COMPOSE_PROJECT_NAME=nom bash scripts/...
ENV_FILE="${ENV_FILE:-.env.prod}"
export ENV_FILE
COMPOSE="docker compose -f docker-compose.prod.yml${COMPOSE_OVERRIDE:+ -f $COMPOSE_OVERRIDE} --env-file $ENV_FILE"
# shellcheck disable=SC1091
set -a; . "$ENV_FILE"; set +a

$COMPOSE stop backend web
$COMPOSE exec -T postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner < "$dir/db.dump"
if [ -s "$dir/uploads.tar.gz" ]; then
  $COMPOSE run --rm --no-deps -T --entrypoint sh backend -c 'rm -rf /app/public/uploads/* && tar -xzf - -C /app/public' < "$dir/uploads.tar.gz"
fi
$COMPOSE up -d backend web
echo "Tiklandi: $dir"
