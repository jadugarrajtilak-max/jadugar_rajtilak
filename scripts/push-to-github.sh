#!/usr/bin/env bash
# Push the clean main branch to GitHub.
# Usage: ./scripts/push-to-github.sh <YOUR_PAT>
# (Update your fine-grained PAT to include the "jadugar_rajtilak" repo first,
#  or use a classic PAT with repo scope — see README notes in the chat.)
set -euo pipefail
PAT="${1:?Usage: ./scripts/push-to-github.sh <PAT>}"
cd "$(dirname "$0")/.."
git push "https://x-access-token:${PAT}@github.com/jadugarrajtilak-max/jadugar_rajtilak.git" main
echo "✓ Pushed main → github.com/jadugarrajtilak-max/jadugar_rajtilak"
