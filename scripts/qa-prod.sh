#!/bin/bash
set -u
BASE="https://jadugar-rajtilak.vercel.app"
PASS=0; FAIL=0
check() {
  local name="$1"; local expect="$2"; local got="$3"
  if echo "$got" | grep -q "$expect"; then
    PASS=$((PASS+1)); echo "  PASS $name"
  else
    FAIL=$((FAIL+1)); echo "  FAIL $name -> expected [$expect] got: $(echo "$got" | head -c 300)"
  fi
}

echo "-- 1. Public site --"
R=$(curl -s -o /dev/null -w "%{http_code}" $BASE/)
check "homepage 200" "200" "$R"
R=$(curl -s -o /dev/null -w "%{http_code}" $BASE/about)
check "/about 200" "200" "$R"
R=$(curl -s -o /dev/null -w "%{http_code}" $BASE/robots.txt)
check "robots.txt 200" "200" "$R"
R=$(curl -s $BASE/api/site/customization)
check "customization API" '"rev"' "$R"

echo "-- 2. Admin login --"
LOGIN=$(curl -s -X POST $BASE/api/admin/login -H "Content-Type: application/json" -d '{"email":"jadugar.rajtilak@gmail.com","password":"${ADMIN_PASSWORD:?source scripts/.env.ops}"}')
check "admin login token" '"token"' "$LOGIN"
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
BAD=$(curl -s -X POST $BASE/api/admin/login -H "Content-Type: application/json" -d '{"email":"x@y.com","password":"nope"}')
check "bad login rejected" '"error"' "$BAD"

echo "-- 3. Lead pipeline E2E --"
DATE=$(date -d "+50 days" +%Y-%m-%d)
LEAD=$(curl -s -X POST $BASE/api/leads -H "Content-Type: application/json" -d "{\"name\":\"Prod QA Verification\",\"phone\":\"9888888888\",\"email\":\"prod-qa@jadugarrayjtilak.in\",\"eventType\":\"corporate\",\"eventDate\":\"$DATE\",\"city\":\"Mumbai\",\"guests\":180,\"budget\":\"Rs 50,000 - 1,00,000\",\"venueType\":\"Auditorium\",\"duration\":\"60 minutes\",\"notes\":\"Production end-to-end QA lead.\",\"consent\":true,\"website\":\"\",\"utmSource\":\"prod-qa\",\"utmMedium\":\"test\"}")
check "lead created" '"leadId"' "$LEAD"
LIST=$(curl -s $BASE/api/leads -H "x-admin-key: $TOKEN")
check "admin sees prod lead" "Prod QA Verification" "$LIST"
NOAUTH=$(curl -s $BASE/api/leads)
check "leads need auth" "Unauthorized" "$NOAUTH"

echo "-- 4. Contact inbox --"
MSG=$(curl -s -X POST $BASE/api/contact -H "Content-Type: application/json" -d '{"name":"Prod QA","email":"prod@qa.test","message":"Production contact form test."}')
check "contact saved" '"ok":true' "$MSG"

echo "-- 5. Image upload (postgres tier) + media --"
UP=$(curl -s -X POST $BASE/api/admin/upload -H "x-admin-key: $TOKEN" -F "file=@/home/z/my-project/public/images/logo-emblem-v2.png;type=image/png")
check "upload works" '"url"' "$UP"
echo "     upload: $UP"
MEDIA_URL=$(echo "$UP" | python3 -c "import sys,json;print(json.load(sys.stdin).get('url',''))" 2>/dev/null)
if [ -n "$MEDIA_URL" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$MEDIA_URL")
  check "media serves 200" "200" "$CODE"
fi

echo "-- 6. Customization edit -> live --"
PUT=$(curl -s -X PUT $BASE/api/admin/assets -H "x-admin-key: $TOKEN" -H "Content-Type: application/json" -d '{"kind":"asset","key":"home.hero.portrait","alt":"Prod QA alt verification"}')
check "alt update saved" '"ok":true' "$PUT"
LIVE=$(curl -s $BASE/api/site/customization)
check "live reflects alt" "Prod QA alt verification" "$LIVE"

echo "-- 7. Stats --"
STATS=$(curl -s $BASE/api/admin/stats -H "x-admin-key: $TOKEN")
check "stats loads" '"totals"' "$STATS"
check "sees QA lead" '"leads":1' "$STATS"

echo ""
echo "PROD QA RESULT: $PASS passed, $FAIL failed"
