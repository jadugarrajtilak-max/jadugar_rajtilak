#!/usr/bin/env node
// Optimize the competition-poster certificate (user upload 479ade90) for the site.
// Output: public/images/certificate-competition-2021.webp (~1101x1428, q82)
// Also recompress gallery-arvanah.webp (236KB -> target <190KB at q78).
const sharp = require('/home/z/.npm-global/lib/node_modules/sharp');
const fs = require('fs');

(async () => {
  // 1) Competition poster certificate
  const posterIn = '/home/z/my-project/upload/479ade90-9f6a-46d4-97cc-74300b2216b8.png';
  const posterOut = '/home/z/my-project/public/images/certificate-competition-2021.webp';
  const m1 = await sharp(posterIn).metadata();
  await sharp(posterIn)
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(posterOut);
  console.log(`poster: ${m1.width}x${m1.height} -> ${posterOut} (${(fs.statSync(posterOut).size / 1024).toFixed(0)}KB)`);

  // verify output dims
  const m2 = await sharp(posterOut).metadata();
  console.log(`poster out: ${m2.width}x${m2.height} ratio=${(m2.width / m2.height).toFixed(3)}`);

  // 2) Recompress arvanah (currently 236KB)
  const arvIn = '/home/z/my-project/public/images/gallery-arvanah.webp';
  const arvBackup = '/tmp/gallery-arvanah-backup.webp';
  fs.copyFileSync(arvIn, arvBackup);
  const m3 = await sharp(arvBackup).metadata();
  await sharp(arvBackup)
    .webp({ quality: 78, effort: 6 })
    .toFile(arvIn);
  console.log(`arvanah: ${m3.width}x${m3.height} -> ${(fs.statSync(arvIn).size / 1024).toFixed(0)}KB (was ${(fs.statSync(arvBackup).size / 1024).toFixed(0)}KB)`);
})();
