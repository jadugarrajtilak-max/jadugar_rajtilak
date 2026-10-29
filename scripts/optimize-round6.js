// Round 6 — performance asset optimization (Lighthouse 64 → 95+ push)
// 1. Favicon: 512px/101KB PNG → 128px icon-v3.png (a few KB)
// 2. Apple icon: recompressed 180px apple-icon-v3.png
// 3. Full logo: 799px/110KB → 440px-wide logo-full-v4.webp (renders ≤215 CSS px)
// 4. Emblem: 720px/52KB → 160px logo-emblem-v4.webp (renders ≤40 CSS px)
// 5. Certificates: recompress to q75 (they render as cards + lightbox)
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const IMG = "/home/z/my-project/public/images";

async function stat(file) {
  return { file: path.basename(file), kb: Math.round(fs.statSync(file).size / 1024) };
}

(async () => {
  const results = [];

  // 1. Favicon — 128×128 PNG, palette-compressed
  await sharp(`${IMG}/icon-v2.png`)
    .resize(128, 128, { fit: "inside", withoutEnlargement: true })
    .png({ quality: 90, palette: true, compressionLevel: 9, effort: 7 })
    .toFile(`${IMG}/icon-v3.png`);
  results.push(await stat(`${IMG}/icon-v3.png`));

  // 2. Apple touch icon — 180×180 PNG
  await sharp(`${IMG}/apple-icon-v2.png`)
    .resize(180, 180, { fit: "inside", withoutEnlargement: true })
    .png({ quality: 90, palette: true, compressionLevel: 9, effort: 7 })
    .toFile(`${IMG}/apple-icon-v3.png`);
  results.push(await stat(`${IMG}/apple-icon-v3.png`));

  // 3. Full logo — hero crest renders ≤215 CSS px → 440 device px
  await sharp(`${IMG}/logo-full-v3.webp`)
    .resize(440, null, { withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toFile(`${IMG}/logo-full-v4.webp`);
  results.push(await stat(`${IMG}/logo-full-v4.webp`));

  // 4. Emblem — renders ≤40 CSS px → 160 device px keeps 2x+ headroom
  await sharp(`${IMG}/logo-emblem-v3.webp`)
    .resize(160, 160, { withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toFile(`${IMG}/logo-emblem-v4.webp`);
  results.push(await stat(`${IMG}/logo-emblem-v4.webp`));

  // 5. Certificates — q75 keeps the engraved text crisp in the lightbox
  for (const name of ["certificate-ibm-honour", "certificate-intl-competition"]) {
    const src = `${IMG}/${name}.webp`;
    const meta = await sharp(src).metadata();
    await sharp(src)
      .resize({ width: Math.min(meta.width ?? 1400, 1400), withoutEnlargement: true })
      .webp({ quality: 75, effort: 4 })
      .toFile(`${IMG}/${name}-opt.webp`);
    const before = Math.round(fs.statSync(src).size / 1024);
    const after = Math.round(fs.statSync(`${IMG}/${name}-opt.webp`).size / 1024);
    if (after < before) {
      fs.renameSync(`${IMG}/${name}-opt.webp`, src);
      results.push({ file: `${name}.webp`, kb: after });
    } else {
      fs.unlinkSync(`${IMG}/${name}-opt.webp`);
      results.push({ file: `${name}.webp (kept)`, kb: before });
    }
  }

  console.table(results);
  console.log("done");
})().catch((e) => { console.error(e); process.exit(1); });
