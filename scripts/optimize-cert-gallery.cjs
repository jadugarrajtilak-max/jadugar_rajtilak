// Optimize the user's certificate + gallery photos for the site.
// - certificate-intl-2021.webp  (About page certificate display)
// - gallery ARVANAH + close-up kids photos -> webp for DB MediaAsset upload
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const UP = '/home/z/my-project/upload';
const OUT = '/tmp/optimized';
fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  // [source, output, maxWidth, quality]
  ['a8298b88-7425-4caa-b32d-90a49cbc5217.png', 'certificate-intl-2021.webp', 1400, 82],
  ['100d6f8e-efda-4a06-ad4e-c154a4fb3c66.png', 'gallery-arvanah.webp', 1200, 80],
  ['3db6bb0643c746e4ad3f896967dc3e1e.png', 'gallery-closeup-kids.webp', 1200, 80],
];

(async () => {
  for (const [src, out, w, q] of jobs) {
    const input = path.join(UP, src);
    const meta = await sharp(input).metadata();
    console.log(`${src}: ${meta.width}x${meta.height} -> ${out}`);
    await sharp(input)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: q })
      .toFile(path.join(OUT, out));
    const stat = fs.statSync(path.join(OUT, out));
    console.log(`  => ${out}: ${(stat.size / 1024).toFixed(0)} KB`);
  }
})();
