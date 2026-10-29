// Image optimization pipeline — converts uploads + site images to WebP
// 1. Five new gallery photos (client-supplied) → WebP
// 2. Two certificates → WebP
// 3. Hero portrait → arch-safe composition (nothing important under the frame corners)
// 4. Remaining in-use site images → WebP for performance
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const UP = "/home/z/my-project/upload";
const OUT = "/home/z/my-project/public/images";

const jobs = [
  // ── New gallery photos ──
  { in: `${UP}/5f3c24eb-ded1-4e20-845e-6a1e50be21e2.png`, out: `${OUT}/gallery-stage-mic.webp`, width: 900, q: 80 },
  { in: `${UP}/100d6f8e-efda-4a06-ad4e-c154a4fb3c66.png`, out: `${OUT}/gallery-arvanah-gala.webp`, width: 1000, q: 80 },
  { in: `${UP}/3db6bb0643c746e4ad3f896967dc3e1e.png`, out: `${OUT}/gallery-kids-wonder.webp`, width: null, q: 82 },
  { in: `${UP}/0184c57033e44f11a2021a4e11494ae8.png`, out: `${OUT}/gallery-umbrella-portrait.webp`, width: null, q: 82 },
  { in: `${UP}/8d0fb3c9-9c5c-48da-a277-2c3698ccd303.png`, out: `${OUT}/gallery-felicitation-hug.webp`, width: 1000, q: 80 },
  // ── Certificates ──
  { in: `${UP}/a8298b88-7425-4caa-b32d-90a49cbc5217.png`, out: `${OUT}/certificate-ibm-honour.webp`, width: 1000, q: 82 },
  { in: `${UP}/479ade90-9f6a-46d4-97cc-74300b2216b8.png`, out: `${OUT}/certificate-intl-competition.webp`, width: 1000, q: 82 },
  // ── Existing site images → WebP ──
  { in: `${OUT}/story-performance-v2.jpg`, out: `${OUT}/story-performance-v3.webp`, width: 900, q: 80 },
  { in: `${OUT}/reel-poster-v2.jpg`, out: `${OUT}/reel-poster-v3.webp`, width: 900, q: 80 },
  { in: `${OUT}/about-award-v2.jpg`, out: `${OUT}/about-award-v3.webp`, width: 1000, q: 80 },
  { in: `${OUT}/svc-corporate.jpg`, out: `${OUT}/svc-corporate-v3.webp`, width: 1000, q: 80 },
  { in: `${OUT}/svc-college-v2.jpg`, out: `${OUT}/svc-college-v3.webp`, width: 1000, q: 80 },
  { in: `${OUT}/svc-private-v2.jpg`, out: `${OUT}/svc-private-v3.webp`, width: 900, q: 80 },
  { in: `${OUT}/logo-full-v2.png`, out: `${OUT}/logo-full-v3.webp`, width: null, q: 92, alpha: true },
  { in: `${OUT}/logo-emblem-v2.png`, out: `${OUT}/logo-emblem-v3.webp`, width: null, q: 92, alpha: true },
];

async function toWebp({ in: infile, out, width, q, alpha }) {
  let img = sharp(infile);
  const meta = await img.metadata();
  let pipeline = sharp(infile);
  if (width && meta.width > width) pipeline = pipeline.resize({ width, withoutEnlargement: true });
  await pipeline.webp({ quality: q, effort: 5 }).toFile(out);
  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  console.log(`✓ ${path.basename(out).padEnd(34)} ${String(fs.statSync(out).size ? (meta.width + "x" + meta.height) : "").padEnd(10)} ${kb}KB  (was ${(fs.statSync(infile).size / 1024).toFixed(0)}KB)`);
}

// ── Hero portrait: arch-safe composition ──
// Canvas 900x1200 (3:4) filled with plum-deep; the original photo is
// inset at 80% width with a feathered mask so the royal arch frame can
// never clip the subject — only the dark studio margin sits under the curve.
async function heroPortrait() {
  const W = 900, H = 1200;
  const pw = 720, ph = 960; // 80% width, keeps 3:4 of the photo
  const px = (W - pw) / 2, py = (H - ph) / 2;

  // photo resized to fit
  const photo = await sharp(`${OUT}/hero-portrait-v2.jpg`)
    .resize(pw, ph, { fit: "cover", position: "top" })
    .toBuffer();

  // feathered rounded-rect alpha mask
  const maskSvg = Buffer.from(
    `<svg width="${pw}" height="${ph}">
       <defs><filter id="f"><feGaussianBlur stdDeviation="16"/></filter></defs>
       <rect x="14" y="14" width="${pw - 28}" height="${ph - 28}" rx="30" fill="#fff" filter="url(#f)"/>
     </svg>`
  );
  const masked = await sharp(photo)
    .composite([{ input: maskSvg, blend: "dest-in" }])
    .png()
    .toBuffer();

  // subtle vignette so the blend into plum-deep feels graded
  const vignette = Buffer.from(
    `<svg width="${pw}" height="${ph}">
       <defs>
         <radialGradient id="v" cx="50%" cy="42%" r="75%">
           <stop offset="55%" stop-color="#000" stop-opacity="0"/>
           <stop offset="100%" stop-color="#150c20" stop-opacity="0.55"/>
         </radialGradient>
       </defs>
       <rect width="${pw}" height="${ph}" fill="url(#v)"/>
     </svg>`
  );

  await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 21, g: 12, b: 32, alpha: 1 } },
  })
    .composite([
      { input: masked, left: Math.round(px), top: Math.round(py) },
      { input: await sharp(masked).composite([{ input: vignette, blend: "in" }]).png().toBuffer(), left: Math.round(px), top: Math.round(py) },
    ])
    .webp({ quality: 84, effort: 5 })
    .toFile(`${OUT}/hero-portrait-v3.webp`);

  const kb = (fs.statSync(`${OUT}/hero-portrait-v3.webp`).size / 1024).toFixed(0);
  console.log(`✓ hero-portrait-v3.webp (arch-safe 900x1200)   ${kb}KB  (was 132KB)`);
}

(async () => {
  for (const j of jobs) await toWebp(j);
  await heroPortrait();
  console.log("\nDone — all images optimized to WebP.");
})().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
