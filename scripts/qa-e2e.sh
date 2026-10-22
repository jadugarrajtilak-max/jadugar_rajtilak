#!/bin/bash
# ─────────────────────────────────────────────────────────────
# End-to-end QA — Jadugar Rajtilak site on Neon Postgres.
# Proves: lead pipeline saves real data, contact inbox saves,
# admin login works, image upload + media serving works,
# customization reflects admin edits, admin stats connected.
# ─────────────────────────────────────────────────────────────
set -u
BASE="http://localhost:3000"
PASS=0; FAIL=0

check() {
  local name="$1"; local expect="$2"; local got="$3"
  if echo "$got" | grep -q "$expect"; then
    PASS=$((PASS+1)); echo "  ✔ $name"
  else
    FAIL=$((FAIL+1)); echo "  ✘ $name  → expected [$expect] got: $(echo "$got" | head -c 300)"
  fi
}

echo "── 1. Public site & customization ──"
R=$(curl -s -o /dev/null -w "%{http_code}" $BASE/)
check "homepage renders (200)" "200" "$R"
R=$(curl -s $BASE/api/site/customization)
check "customization payload (defaults)" '"rev"' "$R"

echo "── 2. Master Admin login ──"
LOGIN=$(curl -s -X POST $BASE/api/admin/login -H "Content-Type: application/json" \
  -d '{"email":"jadugar.rajtilak@gmail.com","password":"${ADMIN_PASSWORD:?source scripts/.env.ops}"}')
check "admin login issues token" '"token"' "$LOGIN"
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
BAD=$(curl -s -X POST $BASE/api/admin/login -H "Content-Type: application/json" \
  -d '{"email":"wrong@x.com","password":"nope"}')
check "wrong credentials rejected (401)" '"error"' "$BAD"

echo "── 3. Lead pipeline (real test lead, end-to-end) ──"
DATE=$(date -d "+45 days" +%Y-%m-%d)
LEAD=$(curl -s -X POST $BASE/api/leads -H "Content-Type: application/json" -d @- << EOF
{
  "name": "QA Pipeline Test",
  "phone": "9999999999",
  "email": "qa-test@jadugarrayjtilak.in",
  "eventType": "wedding",
  "eventDate": "$DATE",
  "city": "Udaipur",
  "guests": 250,
  "budget": "₹1,00,000 – ₹2,50,000",
  "venueType": "Outdoor / lawn",
  "duration": "Full evening (2–3 hr)",
  "notes": "Automated end-to-end QA verification lead.",
  "consent": true,
  "website": "",
  "utmSource": "qa-script",
  "utmMedium": "test",
  "utmCampaign": "pipeline-verification"
}
EOF
)
check "lead accepted (201 + id)" '"leadId"' "$LEAD"
LEAD_ID=$(echo "$LEAD" | python3 -c "import sys,json;print(json.load(sys.stdin).get('leadId',''))" 2>/dev/null)

LIST=$(curl -s $BASE/api/leads -H "x-admin-key: $TOKEN")
check "admin sees the saved lead" "QA Pipeline Test" "$LIST"
check "lead saved with UTM attribution" "qa-script" "$LIST"
NOAUTH=$(curl -s $BASE/api/leads)
check "leads list blocked without admin key" "Unauthorized" "$NOAUTH"

STATUS=$(curl -s -X PATCH $BASE/api/leads/$LEAD_ID -H "x-admin-key: $TOKEN" \
  -H "Content-Type: application/json" -d '{"status":"contacted"}')
check "lead status moves through pipeline" '"contacted"' "$STATUS"

echo "── 4. Contact inbox ──"
MSG=$(curl -s -X POST $BASE/api/contact -H "Content-Type: application/json" \
  -d '{"name":"QA Test Sender","email":"sender@qa.test","message":"End-to-end QA message check."}')
check "contact message saved" '"ok":true' "$MSG"

echo "── 5. Image upload (Postgres tier) + media serving ──"
UP=$(curl -s -X POST $BASE/api/admin/upload -H "x-admin-key: $TOKEN" \
  -F "file=@public/images/logo-emblem-v2.png;type=image/png")
check "upload returns URL" '"url"' "$UP"
echo "     upload response: $UP"
MEDIA_URL=$(echo "$UP" | python3 -c "import sys,json;print(json.load(sys.stdin).get('url',''))" 2>/dev/null)
if [ -n "$MEDIA_URL" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$MEDIA_URL")
  check "media route serves image (200)" "200" "$CODE"
  CT=$(curl -s -o /dev/null -w "%{content_type}" "$BASE$MEDIA_URL")
  check "media content-type is image/png" "image/png" "$CT"
fi

echo "── 6. Admin customization edit → live reflection ──"
PUT=$(curl -s -X PUT $BASE/api/admin/assets -H "x-admin-key: $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"kind\":\"asset\",\"key\":\"home.hero.portrait\",\"alt\":\"QA alt text verification\"}")
check "asset alt text update saved" '"ok":true' "$PUT"
LIVE=$(curl -s $BASE/api/site/customization)
check "live customization reflects new alt" "QA alt text verification" "$LIVE"

echo "── 7. Admin stats (dashboard connected to DB) ──"
STATS=$(curl -s $BASE/api/admin/stats -H "x-admin-key: $TOKEN")
check "stats aggregate loads" '"totals"' "$STATS"
check "stats sees the QA lead (leads ≥ 1)" '"leads":1' "$STATS"

echo "── 8. Availability calendar ──"
MONTH=$(date +%Y-%m)
AVAIL=$(curl -s "$BASE/api/availability?month=$MONTH")
check "availability endpoint responds" '"days"' "$AVAIL"

echo ""
echo "══════════════════════════════════════"
echo "QA RESULT: $PASS passed, $FAIL failed"
echo "══════════════════════════════════════"
exit $FAIL
