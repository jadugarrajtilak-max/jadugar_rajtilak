#!/usr/bin/env python3
# Scrub all secrets from tracked files — replace with env-var reads.
# Secrets move to scripts/.env.ops (gitignored, local only).
import os, re, glob

ROOT = "/home/z/my-project"

NEON_POOLER = process.env.DATABASE_URL
NEON_POOLER_CB = process.env.DATABASE_URL
NEON_POOLER_PLAIN = process.env.DATABASE_URL
NEON_DIRECT = process.env.DATABASE_URL
VERCEL_TOKEN = process.env.VERCEL_TOKEN
ADMIN_PASS = process.env.ADMIN_PASSWORD || ''
TEAM = "team_ndEM5sNbP7WtAIkKmtduOcAQ"
PID = "prj_vbsWZXXVtYAnXlClNlwwWcBb0NRi"

# 1) local-only ops env file
ops = f"""# LOCAL ONLY — never commit. Loaded manually when running ops scripts.
# source scripts/.env.ops  (shell)   or: node --env-file=scripts/.env.ops script.cjs
export DATABASE_URL='{NEON_POOLER_PLAIN}'
export DATABASE_URL_POOLED='{NEON_POOLER}'
export DIRECT_DATABASE_URL='{NEON_DIRECT}'
export VERCEL_TOKEN='{VERCEL_TOKEN}'
export VERCEL_TEAM='{TEAM}'
export VERCEL_PROJECT_ID='{PID}'
export ADMIN_PASSWORD='{ADMIN_PASS}'
"""
with open(f"{ROOT}/scripts/.env.ops", "w") as f:
    f.write(ops)
os.chmod(f"{ROOT}/scripts/.env.ops", 0o600)

# 2) scrub every tracked text file under scripts/ + repo-level configs
targets = []
for ext in ("*.cjs", "*.js", "*.mjs", "*.sh", "*.ts", "*.py"):
    targets += glob.glob(f"{ROOT}/scripts/**/{ext}", recursive=True)

changed = []
for path in sorted(set(targets)):
    if "/img/" in path or "/imgfix/" in path or "/liveaudit/" in path or "/round" in path:
        continue  # binary/shot dirs
    try:
        with open(path) as f:
            src = f.read()
    except Exception:
        continue
    orig = src
    is_sh = path.endswith(".sh")

    def repl_node(m):
        return "process.env.DATABASE_URL"

    # node-style: quoted URL literal -> process.env.DATABASE_URL
    for u in (NEON_POOLER, NEON_POOLER_CB, NEON_POOLER_PLAIN, NEON_DIRECT):
        src = src.replace(f"'{u}'", "process.env.DATABASE_URL")
        src = src.replace(f'"{u}"', "process.env.DATABASE_URL")
        src = src.replace(f"`{u}`", "process.env.DATABASE_URL")
        if is_sh:
            src = src.replace(u, "${DATABASE_URL:?source scripts/.env.ops first}")

    # vercel token
    src = src.replace(f'"{VERCEL_TOKEN}"', '"${VERCEL_TOKEN:?source scripts/.env.ops}"' if is_sh else "process.env.VERCEL_TOKEN")
    src = src.replace(f"'{VERCEL_TOKEN}'", "${VERCEL_TOKEN:?source scripts/.env.ops}" if is_sh else "process.env.VERCEL_TOKEN")
    src = src.replace(VERCEL_TOKEN, "${VERCEL_TOKEN:?source scripts/.env.ops}" if is_sh else "process.env.VERCEL_TOKEN")

    # team / project id alongside token usage in sh
    if is_sh:
        src = src.replace(TEAM, "${VERCEL_TEAM}")
        src = src.replace(PID, "${VERCEL_PROJECT_ID}")

    # admin password (login bodies in QA scripts + set-vercel-env)
    if is_sh:
        src = src.replace(f'"{ADMIN_PASS}"', '"${ADMIN_PASSWORD:?source scripts/.env.ops}"')
        src = src.replace(ADMIN_PASS, "${ADMIN_PASSWORD:?source scripts/.env.ops}")
    else:
        src = src.replace(f"'{ADMIN_PASS}'", "process.env.ADMIN_PASSWORD || ''")
        src = src.replace(f'"{ADMIN_PASS}"', "process.env.ADMIN_PASSWORD || ''")

    if src != orig:
        with open(path, "w") as f:
            f.write(src)
        changed.append(os.path.relpath(path, ROOT))

print("scrubbed files:")
for c in changed:
    print(" -", c)

# 3) verify nothing remains
bad = []
for path in sorted(set(targets)):
    if "/img/" in path or "/imgfix/" in path or "/liveaudit/" in path or "/round" in path:
        continue
    try:
        with open(path) as f:
            s = f.read()
    except Exception:
        continue
    for secret in (NEON_POOLER, NEON_POOLER_CB, NEON_POOLER_PLAIN, NEON_DIRECT, VERCEL_TOKEN, ADMIN_PASS):
        if secret in s:
            bad.append((os.path.relpath(path, ROOT), secret[:25]))
print("\nremaining leaks:", bad if bad else "NONE ✓")
