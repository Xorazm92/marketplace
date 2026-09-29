#!/usr/bin/env bash
# Qo'riqchi hook'ining sinovi: bash .claude/hooks/guard-bash.test.sh .claude/hooks/guard-bash.sh
G="$1"

check() {
  local desc="$1" cmd="$2" want="$3"
  # Qo'riqchi ruxsat berganda hech narsa chiqarmaydi — bo'sh natija "ruxsat".
  local out got
  out=$(printf '%s' "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":$(printf '%s' "$cmd" | jq -Rs .)}}" | bash "$G")
  if [ -z "$out" ]; then
    got=ruxsat
  else
    got=$(printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision')
  fi
  if [ "$got" = "$want" ]; then
    printf '  OK   %-44s → %s\n' "$desc" "$got"
  else
    printf '  XATO %-44s → %s (kutilgan: %s)\n' "$desc" "$got" "$want"
    FAILED=1
  fi
}

FAILED=0

# To'silishi kerak
check "migratsiya: reset"      "npx prisma migrate reset --force"             deny
check "db push force-reset"    "npx prisma db push --force-reset"             deny
check "db push data-loss"      "npx prisma db push --accept-data-loss"        deny
check "bazani tashlash"        "psql -c 'DROP DATABASE inbola'"               deny
check "jadvalni tozalash"      "psql -c 'truncate table \"order\"'"           deny
check ".env ni add"            "git add backend-main/.env"                    deny
check ".env.test ni add"       "git add backend-main/.env.test"               deny
check "sqlite ni add"          "git add backend-main/dev.db"                  deny
check "redis dump ni add"      "git add backend-main/dump.rdb"                deny

# O'tishi kerak
check "migratsiya: dev"        "npx prisma migrate dev --name add_stock"      ruxsat
check "migratsiya: deploy"     "npx prisma migrate deploy"                    ruxsat
check "db push oddiy"          "npx prisma db push"                           ruxsat
check ".env.example ni add"    "git add backend-main/.env.example"            ruxsat
check "hammasini add"          "git add -A"                                   ruxsat
check "build"                  "npm run build"                                ruxsat
check "heredoc ichida matn"    "$(printf 'cat > A.md <<X\nprisma migrate reset ishlatilmaydi\nX')" ruxsat

echo
[ "$FAILED" = 0 ] && echo "Hammasi o'tdi." || echo "Sinov yiqildi."
exit "$FAILED"
