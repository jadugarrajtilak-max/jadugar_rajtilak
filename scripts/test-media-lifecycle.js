// E2E round 2 — upload conversion + old-image lifecycle:
// 1. Upload a large PNG (>1920px) → must be converted to WebP + resized
// 2. Save to slot A → live payload reflects it
// 3. Replace slot A with a second upload → FIRST upload must be deleted (old image gone)
// 4. Reset slot A → second upload must be deleted too
// 5. Blog post with upload as featured image → replace → old deleted
// 6. Orphan GC: stale upload (backdated via SQL) is collected on next upload
const { Client } = require("pg");

const BASE = "http://127.0.0.1:3100";
const KEY = "jr-upload-e2e-test-key";
const DB = "postgresql://neondb_owner:npg_jW9iZx7wGAQp@ep-super-pine-b43ybe3r.c-6.us-east-2.aws.neon.tech/jr_upload_test?sslmode=require";

const sharp = require("/home/z/my-project/node_modules/sharp");

async function makePng(w, h) {
  return sharp({
    create: { width: w, height: h, channels: 3, background: { r: 120, g: 40, b: 160 } },
  })
    .png()
    .toBuffer();
}

function upload(buf, type = "image/png", name = "test.png") {
  const form = new FormData();
  form.append("file", new File([buf], name, { type }));
  return fetch(`${BASE}/api/admin/upload`, {
    method: "POST",
    headers: { "x-admin-key": KEY },
    body: form,
  });
}

async function mediaStatus(url) {
  const r = await fetch(`${BASE}${url}`);
  return r.status;
}

(async () => {
  let pass = 0, fail = 0;
  const check = (label, cond, extra = "") => {
    if (cond) { pass++; console.log("  ✓", label, extra); }
    else { fail++; console.log("  ✗", label, extra); }
  };

  // ── 1. Large PNG → WebP conversion + downscale ──
  console.log("1) upload conversion");
  const bigPng = await makePng(2400, 1600);
  const up1 = await (await upload(bigPng)).json();
  check("returns ok", up1.ok === true, JSON.stringify({ tier: up1.tier, mime: up1.mime, converted: up1.converted, bytes: up1.bytes }));
  check("converted to webp", up1.mime === "image/webp" && up1.converted === true);
  check("resized under 1920", up1.bytes < 200 * 1024, `${Math.round(up1.bytes / 1024)}KB (source ${Math.round(bigPng.length / 1024)}KB)`);
  const m1 = await fetch(`${BASE}${up1.url}`);
  check("served as image/webp", m1.headers.get("content-type") === "image/webp");

  // ── 2. Save to slot → live ──
  console.log("2) slot save");
  const save1 = await fetch(`${BASE}/api/admin/assets`, {
    method: "PUT",
    headers: { "content-type": "application/json", "x-admin-key": KEY },
    body: JSON.stringify({ key: "about.award.photo", src: up1.url, alt: "e2e alt" }),
  });
  const save1j = await save1.json();
  check("saved", save1.status === 200 && save1j.ok === true);
  const live1 = (await (await fetch(`${BASE}/api/site/customization`)).json()).assets["about.award.photo"];
  check("live payload updated", live1?.src === up1.url);

  // ── 3. Replace slot → old upload deleted ──
  console.log("3) replace → old image deleted");
  const up2 = await (await upload(await makePng(800, 600))).json();
  const save2 = await fetch(`${BASE}/api/admin/assets`, {
    method: "PUT",
    headers: { "content-type": "application/json", "x-admin-key": KEY },
    body: JSON.stringify({ key: "about.award.photo", src: up2.url }),
  });
  check("replaced", save2.status === 200);
  check("old upload deleted (404 now)", (await mediaStatus(up1.url)) === 404, up1.url);
  check("new upload serves", (await mediaStatus(up2.url)) === 200);

  // ── 4. Reset slot → replaced upload deleted ──
  console.log("4) reset → upload deleted");
  const reset = await fetch(`${BASE}/api/admin/reset`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-key": KEY },
    body: JSON.stringify({ scope: "assets", keys: ["about.award.photo"] }),
  });
  check("reset ok", reset.status === 200);
  check("second upload deleted", (await mediaStatus(up2.url)) === 404);
  const live4 = (await (await fetch(`${BASE}/api/site/customization`)).json()).assets["about.award.photo"];
  check("slot back to default", live4?.src === "/images/about-award-v3.webp");

  // ── 5. Blog featured image lifecycle ──
  console.log("5) blog featured image");
  const up3 = await (await upload(await makePng(1000, 700))).json();
  const post = await fetch(`${BASE}/api/admin/blog`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-key": KEY },
    body: JSON.stringify({
      title: "E2E media lifecycle post",
      slug: "e2e-media-lifecycle",
      featuredImage: up3.url,
      sections: [{ h: "Test", paras: ["Test paragraph."] }],
    }),
  });
  const postj = await post.json();
  check("post created", post.status === 201 && postj.ok === true);
  const up4 = await (await upload(await makePng(1000, 700))).json();
  const upd = await fetch(`${BASE}/api/admin/blog/${postj.post.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json", "x-admin-key": KEY },
    body: JSON.stringify({
      title: "E2E media lifecycle post",
      slug: "e2e-media-lifecycle",
      featuredImage: up4.url,
      sections: [{ h: "Test", paras: ["Test paragraph."] }],
    }),
  });
  check("post updated", upd.status === 200);
  check("old featured image deleted", (await mediaStatus(up3.url)) === 404);
  const del = await fetch(`${BASE}/api/admin/blog/${postj.post.id}`, {
    method: "DELETE",
    headers: { "x-admin-key": KEY },
  });
  check("post deleted", del.status === 200);
  check("deleted post's image removed", (await mediaStatus(up4.url)) === 404);

  // ── 6. Orphan GC on upload ──
  console.log("6) orphan GC");
  const orphan = await (await upload(await makePng(600, 400))).json();
  check("orphan uploaded", orphan.ok === true);
  const c = new Client({ connectionString: DB });
  await c.connect();
  await c.query(`UPDATE "MediaAsset" SET "createdAt" = NOW() - INTERVAL '2 days' WHERE id = $1`, [orphan.url.split("/").pop()]);
  await c.end();
  const up5 = await (await upload(await makePng(600, 400))).json();
  check("GC ran on upload", typeof up5.gc === "number" && up5.gc >= 1, `gc=${up5.gc}`);
  check("orphan collected", (await mediaStatus(orphan.url)) === 404);
  check("fresh upload survives GC", (await mediaStatus(up5.url)) === 200);

  console.log(`\n${fail === 0 ? "✅ ALL PASS" : "❌ FAILURES"} — ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => { console.error("E2E crash:", e.message); process.exit(1); });
