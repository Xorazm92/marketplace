#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# XAVFLI BUYRUQLARNI TO'XTATUVCHI QO'RIQCHI (PreToolUse → Bash)
#
# mehnat-ai'dagi qo'riqchidan olingan. Har band shu loyihaning aniq xavfi va
# sababi bilan tushuntiriladi, chunki to'xtatilgan agent nima qilishni bilishi
# kerak. Yangi band qo'shsangiz guard-bash.test.sh ga sinov ham qo'shing.
#
# stdin: hook JSON. stdout: permissionDecision bilan JSON.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""')

# Heredoc TANASI bajarilmaydi, faylga yoziladi — busiz qo'riqchi o'z
# hujjatini (AGENTS.md ichidagi "bu buyruq ishlatilmaydi" matnini) yozishni
# ham to'sardi.
cmd=${cmd%%<<*}

deny() {
  jq -nc --arg r "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $r
    }
  }'
  exit 0
}

# ── 1. Bazani reset qiluvchi prisma buyruqlari ──────────────────────────────
# Buyurtma va to'lov yozuvlari pul bilan bog'liq; reset ularni so'roqsiz
# o'chiradi. Lokal sxema o'zgarishi uchun `migrate dev` yetarli.
if [[ "$cmd" =~ prisma[[:space:]]+migrate[[:space:]]+reset ]] ||
   [[ "$cmd" =~ prisma[[:space:]]+db[[:space:]]+push.*(--force-reset|--accept-data-loss) ]]; then
  deny "Bazani reset qiluvchi prisma buyrug'i to'silgan: buyurtma va to'lov yozuvlari so'roqsiz o'chadi. Sxema o'zgarishi uchun \`npx prisma migrate dev --name <nom>\` (lokal) yoki \`npx prisma migrate deploy\` (server). Reset haqiqatan kerak bo'lsa, egasidan tasdiq so'rang."
fi

# ── 2. Bazani jismonan tashlash/tozalash ────────────────────────────────────
if [[ "$cmd" =~ ([Dd][Rr][Oo][Pp][[:space:]]+[Dd][Aa][Tt][Aa][Bb][Aa][Ss][Ee]|[Tt][Rr][Uu][Nn][Cc][Aa][Tt][Ee][[:space:]]+) ]]; then
  deny "DROP DATABASE / TRUNCATE qo'lda bajarilmaydi. Avval zaxira oling (\`pg_dump\`), keyin egasidan tasdiq so'rang."
fi

# ── 3. Maxfiy va ikkilik fayllarni repoga qo'shish ──────────────────────────
# Allaqachon sodir bo'lgan: backend-main/.env.test, dev.db, dump.rdb git'da.
if [[ "$cmd" =~ git[[:space:]]+add ]] &&
   [[ "$cmd" =~ (\.env([[:space:]]|$|\.local|\.prod|\.production|\.test)|\.db([[:space:]]|$)|dump\.rdb) ]]; then
  deny "\`.env*\` (\`.env.example\` dan tashqari), \`*.db\` va \`dump.rdb\` repoga qo'shilmaydi: ichida secret yoki ma'lumotlar bazasi nusxasi bo'ladi. \`git add\` ni aniq manba fayllariga qarating."
fi

exit 0
