#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SESSIYA BOSHIDAGI HOLAT (SessionStart)
#
# Faqat O'ZGARUVCHI ma'lumot. Doimiy qoidalar AGENTS.md da — bu yerga
# ko'chirish ikki nusxa yaratardi va biri eskirardi.
# Tarmoqqa chiqmaydi, bir soniyadan kam ishlaydi.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail
cd "$(dirname "$0")/../.." || exit 0

branch=$(git branch --show-current 2>/dev/null || echo "?")
dirty=$(git status --porcelain 2>/dev/null | grep -c "" || echo 0)
last=$(git log --oneline -1 2>/dev/null || echo "-")

# Parolsiz ulanish satri: qaysi bazaga ulanishini ko'rsatadi, secret'ni emas.
db=$(grep -hoP '(?<=^DATABASE_URL=)["]?[^"]+' backend-main/.env 2>/dev/null | head -1 |
     tr -d '"' | sed -E 's|.*://([^:]+):[^@]*@|\1@|' || true)

port_state() { (echo >/dev/tcp/127.0.0.1/"$1") >/dev/null 2>&1 && echo up || echo down; }

deps() { [ -d "$1/node_modules" ] && echo bor || echo "YO'Q (npm ci)"; }

echo "Loyiha holati (SessionStart hook):"
echo "- shox: $branch | commit qilinmagan: $dirty ta"
echo "- oxirgi commit: $last"
echo "- baza: ${db:-backend-main/.env topilmadi}"
echo "- backend :4000 $(port_state 4000) | web :3000 $(port_state 3000) | test Postgres :5544 $(port_state 5544)"
echo "- node_modules: backend $(deps backend-main), web $(deps web)"
echo "- reja: docs/plan/MVP_ROADMAP.md · sifat: docs/QUALITY_BAR.md"
