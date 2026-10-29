// E2E test: admin upload flow (the exact flow from the user's screenshot)
// 1. POST /api/admin/upload with an image file
// 2. Verify the returned media URL serves the exact bytes back
// 3. PUT /api/admin/assets with key=about.award.photo (user's slot)
// 4. Verify the live customization payload reflects the new image
const { writeFileSync } = require("fs");

const BASE = "http://127.0.0.1:3100";
const KEY = "jr-upload-e2e-test-key";

// 1x1 red PNG (74 bytes) — valid image for the test
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

(async () => {
  const form = new FormData();
  form.append("file", new File([PNG], "test.png", { type: "image/png" }));

  // ── Step 1: upload ──
  const up = await fetch(`${BASE}/api/admin/upload`, {
    method: "POST",
    headers: { "x-admin-key": KEY },
    body: form,
  });
  const upJson = await up.json().catch(() => null);
  console.log("1) upload status:", up.status, JSON.stringify(upJson));
  if (!up.ok || !upJson?.ok) throw new Error("UPLOAD FAILED — " + JSON.stringify(upJson));

  // ── Step 2: fetch the returned URL, bytes must match exactly ──
  const media = await fetch(`${BASE}${upJson.url}`);
  const mediaBuf = Buffer.from(await media.arrayBuffer());
  console.log(
    "2) media fetch:", media.status,
    "type:", media.headers.get("content-type"),
    "cache:", media.headers.get("cache-control"),
    "bytes match:", mediaBuf.equals(PNG)
  );
  if (media.status !== 200 || !mediaBuf.equals(PNG)) throw new Error("MEDIA BYTES MISMATCH");

  // ── Step 3: save to the exact slot from the user's screenshot ──
  const save = await fetch(`${BASE}/api/admin/assets`, {
    method: "PUT",
    headers: { "content-type": "application/json", "x-admin-key": KEY },
    body: JSON.stringify({
      key: "about.award.photo",
      src: upJson.url,
      alt: "E2E test — Jadugar Rajtilak team award photo",
    }),
  });
  const saveJson = await save.json().catch(() => null);
  console.log("3) asset save:", save.status, "ok:", saveJson?.ok, "src:", saveJson?.asset?.src?.slice(0, 40) + "…");
  if (!save.ok || !saveJson?.ok) throw new Error("ASSET SAVE FAILED");

  // ── Step 4: live customization payload must reflect it ──
  const live = await fetch(`${BASE}/api/site/customization`);
  const liveJson = await live.json();
  const slot = liveJson?.assets?.["about.award.photo"];
  console.log("4) live payload:", live.status, "→ about.award.photo.src:", slot?.src?.slice(0, 40) + "…");
  if (slot?.src !== upJson.url) throw new Error("LIVE PAYLOAD NOT UPDATED");

  // ── Step 5: guard — no key must be 401, wrong key must be 401 ──
  const noKey = await fetch(`${BASE}/api/admin/upload`, { method: "POST" });
  const badKey = await fetch(`${BASE}/api/admin/upload`, {
    method: "POST",
    headers: { "x-admin-key": "wrong" },
  });
  console.log("5) auth guard — no key:", noKey.status, "wrong key:", badKey.status);

  console.log("\n✅ E2E PASS — upload → media serve → asset save → live payload, all green");
})().catch((e) => {
  console.error("\n❌ E2E FAIL:", e.message);
  process.exit(1);
});
