#!/usr/bin/env bash
# CI'dagi (.github/workflows/ci.yml) barcha qadamlar bitta joyda — GitHub Actions ishlamayotgan
# paytda yagona dalil. Har qadam alohida bajariladi, bittasi yiqilsa qolganlari davom etadi;
# oxirida jadval chiqadi va birorta qadam yiqilgan bo'lsa chiqish kodi 1.
#
#   TEST_DATABASE_URL=postgresql://.../nomi_test \
#   E2E_DATABASE_URL=postgresql://.../nomi_pw_test \
#   bash scripts/verify-all.sh [--install] [--docker] [--e2e-runs 3] [--skip-browser]
#
#   --install       avval `npm ci` (toza muhit uchun; odatda node_modules bor deb hisoblanadi)
#   --docker        image'larni build qiladi va `docker compose config` ni tekshiradi (bo'lsa)
#   --e2e-runs N    backend e2e'ni N marta ketma-ket (poyga testlari barqarorligi; standart 3)
#   --skip-browser  Playwright'siz (brauzer yo'q muhit)
#   PW_CHANNEL=chrome — Playwright brauzeri o'rniga tizimdagi Chrome.
#
# Ikkala baza ham test paytida TOZALANADI: nomi `_test` bilan tugamasa skript ishlamaydi.
set -uo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"

INSTALL=0 DOCKER=0 E2E_RUNS=3 BROWSER=1
while [ $# -gt 0 ]; do
  case "$1" in
    --install) INSTALL=1 ;;
    --docker) DOCKER=1 ;;
    --skip-browser) BROWSER=0 ;;
    --e2e-runs) E2E_RUNS="$2"; shift ;;
    *) echo "Noma'lum parametr: $1" >&2; exit 2 ;;
  esac
  shift
done

db_name() { local url="${1%%\?*}"; echo "${url##*/}"; }
for var in TEST_DATABASE_URL E2E_DATABASE_URL; do
  [ "$var" = E2E_DATABASE_URL ] && [ "$BROWSER" = 0 ] && continue
  url="${!var:-}"
  [ -n "$url" ] || { echo "XATO: $var berilmagan" >&2; exit 2; }
  case "$(db_name "$url")" in
    *_test) ;;
    *) echo "XATO: $var bazasi nomi \"_test\" bilan tugashi kerak (testlar bazani tozalaydi)" >&2; exit 2 ;;
  esac
done
if [ "$BROWSER" = 1 ] && [ "$(db_name "$TEST_DATABASE_URL")" = "$(db_name "$E2E_DATABASE_URL")" ]; then
  echo "XATO: TEST_DATABASE_URL va E2E_DATABASE_URL alohida bazalar bo'lishi kerak" >&2; exit 2
fi

LOG_DIR="$(mktemp -d "${TMPDIR:-/tmp}/inbola-verify.XXXXXX")"
RESULTS=()
FAILED=0

# step <nom> <papka> <buyruq...> — chiqishi faylga, natijasi jadvalga.
step() {
  local name="$1" dir="$2"; shift 2
  local log="$LOG_DIR/$(printf '%02d' "${#RESULTS[@]}")-$(echo "$name" | tr -c 'A-Za-z0-9' '_').log"
  local started=$SECONDS
  printf '▶ %s ... ' "$name"
  if (cd "$ROOT/$dir" && "$@") >"$log" 2>&1; then
    RESULTS+=("OK|$name|$((SECONDS - started))s|")
    echo "ok ($((SECONDS - started))s)"
  else
    FAILED=1
    RESULTS+=("XATO|$name|$((SECONDS - started))s|$log")
    echo "XATO — $log"
    tail -n 15 "$log" | sed 's/^/    /'
  fi
}
skip() { RESULTS+=("O'TKAZILDI|$1||$2"); echo "– $1: o'tkazib yuborildi ($2)"; }

echo "INBOLA verify-all: $(git rev-parse --abbrev-ref HEAD) @ $(git rev-parse --short HEAD)$(git diff --quiet HEAD -- 2>/dev/null || echo ' + commit qilinmagan o'"'"'zgarishlar')"
echo "Loglar: $LOG_DIR"

# ── Repo ────────────────────────────────────────────────────────────────────
step "guard hook sinovlari" . bash .claude/hooks/guard-bash.test.sh .claude/hooks/guard-bash.sh
step "skriptlar sintaksisi (bash -n)" . bash -c 'for f in scripts/*.sh .claude/hooks/*.sh; do bash -n "$f" || exit 1; done'
# Repoda maxfiy fayl yoki kalit yo'q: .env* dan faqat namunalar, xususiy kalit bloklari yo'q.
step "repoda maxfiy fayl yo'q" . bash -c '
  bad=$(git ls-files | grep -E "(^|/)\.env($|\.)" | grep -v -E "\.example$" || true)
  [ -z "$bad" ] || { echo "Kuzatilayotgan env fayllar: $bad"; exit 1; }
  ! git grep -l -E "BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY" -- . ":!scripts/verify-all.sh"'

# ── Backend ─────────────────────────────────────────────────────────────────
[ "$INSTALL" = 1 ] && step "backend: npm ci" backend-main npm ci --no-audit --no-fund
step "backend: prisma generate" backend-main npx prisma generate
step "backend: tsc (build config)" backend-main npx tsc --noEmit -p tsconfig.build.json
step "backend: tsc (testlar bilan)" backend-main npx tsc --noEmit -p tsconfig.json
step "backend: eslint" backend-main npm run lint
step "backend: unit testlar" backend-main npm test
step "backend: nest build" backend-main npm run build
step "backend: migratsiyalar (migrate deploy)" backend-main env DATABASE_URL="$TEST_DATABASE_URL" npx prisma migrate deploy
step "backend: sxema = migratsiyalar (drift yo'q)" backend-main npx prisma migrate diff --from-url "$TEST_DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --exit-code
for run in $(seq 1 "$E2E_RUNS"); do
  step "backend: e2e ($run/$E2E_RUNS)" backend-main npm run test:e2e
done
step "backend: npm audit (critical yo'q)" backend-main npm audit --omit=dev --audit-level=critical

# ── Web ─────────────────────────────────────────────────────────────────────
[ "$INSTALL" = 1 ] && step "web: npm ci" web npm ci --no-audit --no-fund
step "web: typecheck" web npm run typecheck
step "web: eslint" web npm run lint
step "web: build" web npm run build
step "web: npm audit (high yo'q)" web npm audit --omit=dev --audit-level=high
if [ "$BROWSER" = 1 ]; then
  step "web: Playwright (butun stek)" web npx playwright test
else
  skip "web: Playwright (butun stek)" "--skip-browser"
fi

# ── Docker ──────────────────────────────────────────────────────────────────
if [ "$DOCKER" = 1 ] && command -v docker >/dev/null 2>&1; then
  step "docker: backend image" . docker build -q -t inbola-verify-backend ./backend-main
  step "docker: web image" . docker build -q -t inbola-verify-web ./web
  if docker compose version >/dev/null 2>&1; then
    # Faqat sintaksis va o'zgaruvchilar: haqiqiy qiymatlar o'rniga namuna fayl.
    step "docker: compose config" . docker compose -f docker-compose.prod.yml --env-file .env.prod.example config --quiet
  else
    skip "docker: compose config" "docker compose plagini o'rnatilmagan"
  fi
else
  skip "docker: image'lar va compose" "--docker berilmagan yoki docker yo'q"
fi

# ── Xulosa ──────────────────────────────────────────────────────────────────
echo
echo "┌─ Natija ($(date '+%F %T'))"
for row in "${RESULTS[@]}"; do
  IFS='|' read -r status name took note <<<"$row"
  printf '│ %-11s %-46s %6s %s\n' "$status" "$name" "$took" "$note"
done
if [ "$FAILED" = 0 ]; then
  echo "└─ HAMMASI O'TDI"
else
  echo "└─ YIQILGAN QADAMLAR BOR — loglar: $LOG_DIR"
fi
exit "$FAILED"
