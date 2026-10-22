#!/bin/bash
# Production server launcher that survives shell session exit.
cd /home/z/my-project
export NODE_ENV=production
exec bun .next/standalone/server.js >> /home/z/my-project/server.log 2>&1
