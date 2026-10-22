// In-place image compression for jadugarrajtilak.com (mobile performance).
// Same filenames + formats → zero code-reference changes, pure byte savings.
// PNGs: palette quantization (logos are flat-colour art).
// JPEGs: mozjpeg + progressive at visually-safe quality.
import sharp from "sharp";
import { readdir, stat, rename } from "node:fs/promises";
import path from "node:path";

const DIR = "/home/z/my-project/public/images";

const JPEG_QUALITY = 74; // visually safe for hero/gallery art
const files = await readdir(DIR);

const report = [];
for (const f of files) {
  const full = path.join(DIR, f);
  const ext = path.extname(f).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;
  const before = (await stat(full)).size;
  const backup = full + ".bak";
  await rename(full, backup);
  try {
    if (ext === ".png") {
      await sharp(backup).png({ palette: true, quality: 82, effort: 9 }).toFile(full);
    } else {
      await sharp(backup)
        .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
        .toFile(full);
    }
    const after = (await stat(full)).size;
    // Only keep the recompressed file if it is meaningfully smaller.
    if (after >= before * 0.95) {
      await rename(backup, full);
      report.push({ file: f, before, after: before, kept: "original (no gain)" });
    } else {
      report.push({ file: f, before, after, saved: before - after });
    }
  } catch (e) {
    // On any failure restore the original untouched.
    await rename(backup, full).catch(() => {});
    report.push({ file: f, error: String(e) });
  }
}

let tb = 0, ta = 0;
for (const r of report) {
  if (r.error) { console.log(`✗ ${r.file}: ${r.error}`); continue; }
  tb += r.before; ta += r.after;
  const pct = (((r.before - r.after) / r.before) * 100).toFixed(1);
  console.log(
    `✓ ${r.file}: ${(r.before / 1024).toFixed(0)}KB → ${(r.after / 1024).toFixed(0)}KB (${pct}% saved)`
  );
}
console.log(`\nTOTAL: ${(tb / 1024).toFixed(0)}KB → ${(ta / 1024).toFixed(0)}KB (saved ${(((tb - ta) / tb) * 100).toFixed(1)}%)`);
