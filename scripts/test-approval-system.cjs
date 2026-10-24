// Local end-to-end test of the AI Permission System + Manager Agent.
// 1. Run the blog agent → expect a DRAFT + a pending AgentApproval row.
// 2. Run the manager agent → expect team health + assignments report.
// 3. Reject one approval → status must flip to rejected, post stays draft.
// 4. Run blog again (new day guard bypassed by manual trigger? no — the
//    marker only blocks scheduler triggers) → second proposal.
// 5. Approve one approval → post goes LIVE (status published).
// 6. CTA click tracking → POST /api/cta → verify row + admin stats read.
const BASE = "http://localhost:3000";
const ADMIN_KEY = "local-dev-key-2026";

async function api(path, init = {}) {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY, ...(init.headers || {}) },
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

let failures = 0;
function check(name, cond, extra = "") {
  console.log(`${cond ? "PASS" : "FAIL"} — ${name}${extra ? ` (${extra})` : ""}`);
  if (!cond) failures++;
}

(async () => {
  // ── 1. run the blog agent (manual) ──
  console.log("\n── 1. Blog Writer run (manual) ──");
  const blogRun = await api("/api/admin/agents/run", { method: "POST", body: JSON.stringify({ agentId: "blog" }) });
  check("blog agent run ok", blogRun.status === 200 && blogRun.json?.ok === true, String(blogRun.json?.summary || "").slice(0, 90));

  // ── state: pending approvals must now contain a blog.publish proposal ──
  const state1 = await api("/api/admin/agents");
  const pending = state1.json?.pendingApprovals ?? [];
  check("approval queue has a pending blog proposal", pending.some((p) => p.kind === "blog.publish"), `${pending.length} pending`);
  const drafts = state1.json?.pendingDrafts ?? [];
  check("draft created (NOT published)", drafts.length >= 1, `${drafts.length} drafts`);
  check("auto-publish default OFF", state1.json?.autoPublish === false);

  // ── 2. manager agent run ──
  console.log("\n── 2. Manager Agent run ──");
  const mgrRun = await api("/api/admin/agents/run", { method: "POST", body: JSON.stringify({ agentId: "manager" }) });
  check("manager agent run ok", mgrRun.status === 200 && mgrRun.json?.ok === true, String(mgrRun.json?.summary || "").slice(0, 110));
  const state2 = await api("/api/admin/agents");
  const mgr = (state2.json?.agents ?? []).find((a) => a.id === "manager");
  check("manager card present in agents list", Boolean(mgr));
  const mgrDetails = mgr?.recentRuns?.[0]?.findings?.details;
  check("manager report has team + assignments", Boolean(mgrDetails?.team) && Array.isArray(mgrDetails?.assignments), `${mgrDetails?.assignments?.length ?? 0} assignments`);

  // ── 3. reject one approval ──
  console.log("\n── 3. Reject a proposal ──");
  const target = pending[pending.length - 1];
  if (target) {
    const rej = await api("/api/admin/agents", { method: "PATCH", body: JSON.stringify({ approvalId: target.id, decision: "reject" }) });
    check("reject decision ok", rej.status === 200 && rej.json?.approval?.status === "rejected");
    const state3 = await api("/api/admin/agents");
    const stillDraft = (state3.json?.pendingDrafts ?? []).some((d) => d.id === (JSON.parse(target.payload || "{}").postId));
    check("rejected draft stays draft (not live)", stillDraft);
    const audit = state3.json?.decidedApprovals ?? [];
    check("audit trail records the rejection", audit.some((a) => a.id === target.id && a.status === "rejected"));
  }

  // ── 4. approve another approval → post must go live ──
  console.log("\n── 4. Approve a proposal → live ──");
  const state4 = await api("/api/admin/agents");
  const approveTarget = (state4.json?.pendingApprovals ?? [])[0];
  if (approveTarget) {
    const app = await api("/api/admin/agents", { method: "PATCH", body: JSON.stringify({ approvalId: approveTarget.id, decision: "approve" }) });
    check("approve decision ok", app.status === 200 && app.json?.approval?.status === "approved", String(app.json?.executed || ""));
    const slug = JSON.parse(approveTarget.payload || "{}").slug;
    if (slug) {
      const post = await fetch(`${BASE}/blog/${slug}`, { redirect: "manual" }).catch(() => null);
      // SPA shell serves 200 for all routes, so also verify via admin blog API
      const blogList = await api("/api/blog");
      const live = (blogList.json?.posts ?? []).some((p) => p.slug === slug);
      check("approved post is LIVE in /api/blog", live, slug);
    }
  } else {
    console.log("SKIP — no pending approval left to approve");
  }

  // ── 5. CTA click tracking ──
  console.log("\n── 5. CTA click tracking ──");
  const cta1 = await fetch(`${BASE}/api/cta`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1" },
    body: JSON.stringify({ cta: "whatsapp", path: "/" }),
  });
  check("cta endpoint 200", cta1.status === 200);
  await fetch(`${BASE}/api/cta`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    body: JSON.stringify({ cta: "call", path: "/contact" }),
  });
  const stats = await api("/api/admin/stats");
  check("stats include CTA metrics", (stats.json?.cta?.total ?? 0) >= 2, `total=${stats.json?.cta?.total}, wa=${stats.json?.cta?.byType?.whatsapp ?? 0}, call=${stats.json?.cta?.byType?.call ?? 0}`);
  check("stats include pendingApprovals", typeof stats.json?.pendingApprovals === "number", String(stats.json?.pendingApprovals));

  // ── 6. security: anonymous access must be rejected ──
  console.log("\n── 6. Security gates ──");
  const anonAgents = await fetch(`${BASE}/api/admin/agents`).then((r) => r.status).catch(() => 0);
  check("anonymous admin API rejected (401)", anonAgents === 401, String(anonAgents));
  const badDecision = await api("/api/admin/agents", { method: "PATCH", body: JSON.stringify({ approvalId: "nonexistent", decision: "approve" }) });
  check("unknown approval id → 404", badDecision.status === 404);
  const badDecision2 = await api("/api/admin/agents", { method: "PATCH", body: JSON.stringify({ approvalId: "x", decision: "maybe" }) });
  check("invalid decision value → 422", badDecision2.status === 422);

  console.log(`\n${failures === 0 ? "ALL CHECKS PASS" : failures + " CHECK(S) FAILED"}`);
  process.exit(failures === 0 ? 0 : 1);
})();
