#!/usr/bin/env bash
# Baza + yuklangan rasmlar zaxirasi. pg_dump YOLG'IZ O'ZI to'liq zaxira emas:
# rasmlar diskda (uploads volume), bazada faqat ularning yo'li turadi.
#   bash scripts/backup.sh            → backups/YYYYmmdd-HHMMSS/{db.dump,uploads.tar.gz}
# Cron (har kuni 03:30): 30 3 * * * cd /opt/inbola && bash scripts/backup.sh >> backups/backup.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."

# Standart: .env.prod va docker-compose.prod.yml. Sinov uchun (staging, lokal) almashtirish mumkin:
#   ENV_FILE=/yo'l/env COMPOSE_OVERRIDE=/yo'l/override.yml COMPOSE_PROJECT_NAME=nom bash scripts/...
ENV_FILE="${ENV_FILE:-.env.prod}"
export ENV_FILE
COMPOSE="docker compose -f docker-compose.prod.yml${COMPOSE_OVERRIDE:+ -f $COMPOSE_OVERRIDE} --env-file $ENV_FILE"
KEEP_DAYS="${KEEP_DAYS:-14}"
dir="backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$dir"

# shellcheck disable=SC1091
set -a; . "$ENV_FILE"; set +a

$COMPOSE exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "$dir/db.dump"
$COMPOSE run --rm --no-deps -T --entrypoint tar backend -czf - -C /app/public uploads > "$dir/uploads.tar.gz"

# Bo'sh fayl — muvaffaqiyatsiz zaxira: jimgina "bor" deb hisoblanmasin.
[ -s "$dir/db.dump" ] || { echo "XATO: db.dump bo'sh" >&2; exit 1; }
echo "Zaxira: $dir ($(du -sh "$dir" | cut -f1))"

find backups -mindepth 1 -maxdepth 1 -type d -mtime +"$KEEP_DAYS" -exec rm -rf {} +
