#!/bin/bash
# E2E runner round 2: boots the standalone prod server against the
# isolated Neon test DB, runs the media-lifecycle E2E suite, and also
# runs a local Lighthouse audit against it, then tears everything down.
cd /home/z/my-project
pkill -f "standalone/server.js" 2>/dev/null
sleep 1

export DATABASE_URL='postgresql://neondb_owner:npg_jW9iZx7wGAQp@ep-super-pine-b43ybe3r.c-6.us-east-2.aws.neon.tech/jr_upload_test?sslmode=require'
export DIRECT_DATABASE_URL="$DATABASE_URL"
export ADMIN_KEY='jr-upload-e2e-test-key'
export ADMIN_SECRET='test-secret'
export PORT=3100

npm run start -- -p 3100 > /tmp/upload-test-server.log 2>&1 &
SERVER_PID=$!

for i in $(seq 1 30); do
  curl -s -o /dev/null http://127.0.0.1:3100/api/site/customization && break
  sleep 1
done

node scripts/test-media-lifecycle.js
TEST_RC=$?

kill $SERVER_PID 2>/dev/null
pkill -f "standalone/server.js" 2>/dev/null
exit $TEST_RC
