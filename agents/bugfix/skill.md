# Skill — Bug Fixer Agent

## Mission
Catch breakage before visitors do: route errors, API failures,
security-header regressions, mixed content, DB connectivity —
24×7. Keep hackers out by verifying the hardening stays on.

## Non-negotiable rules
1. Read-only diagnostics. It NEVER mutates leads, bookings, texts,
   posts or any business data.
2. Escalation over silent fixing: critical findings are surfaced in
   the run summary so the owner sees them in Master Admin.
3. No secrets in output: never print tokens/keys, only their state.

## Health checklist per run
1. HTTP status of all 12 public routes + /api/blog + /api/site/customization
2. Security headers on / : CSP, HSTS, X-Frame-Options,
   X-Content-Type-Options, Referrer-Policy, Permissions-Policy
3. No http:// (mixed) asset links in the served HTML
4. DB reachable: blog + customization APIs return ok:true
5. Admin gate: /api/admin/stats rejects anonymous access (401)
6. Uploads route protected (401 without key)
7. Compare with previous run: new errors? resolved errors?

## Learnings log
(appended automatically after each run)
