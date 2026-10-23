#!/usr/bin/env node
const sharp = require('/home/z/.npm-global/lib/node_modules/sharp');
const files = [
  // user's new uploads
  ['/home/z/my-project/upload/image - 2026-10-22T143027.374.png', 'UP: 4-men LG photo'],
  ['/home/z/my-project/upload/image - 2026-10-22T143123.727.png', 'UP: dove/confetti'],
  ['/home/z/my-project/upload/8d0fb3c9-9c5c-48da-a277-2c3698ccd303.png', 'UP: hug'],
  ['/home/z/my-project/upload/5f3c24eb-ded1-4e20-845e-6a1e50be21e2.png', 'UP: mic night'],
  ['/home/z/my-project/upload/100d6f8e-efda-4a06-ad4e-c154a4fb3c66.png', 'UP: arvanah'],
  ['/home/z/my-project/upload/3db6bb0643c746e4ad3f896967dc3e1e.png', 'UP: kids party'],
  ['/home/z/my-project/upload/0184c57033e44f11a2021a4e11494ae8.png', 'UP: umbrella'],
  ['/home/z/my-project/upload/a8298b88-7425-4caa-b32d-90a49cbc5217.png', 'UP: CERT recognition'],
  ['/home/z/my-project/upload/479ade90-9f6a-46d4-97cc-74300b2216b8.png', 'UP: CERT poster'],
  // deployed webp
  ['/home/z/my-project/public/images/rajtilak-lg-certificate.webp', 'DEP: lg-certificate'],
  ['/home/z/my-project/public/images/rajtilak-stage-confetti.webp', 'DEP: confetti'],
  ['/home/z/my-project/public/images/rajtilak-mic-closeup.webp', 'DEP: mic-closeup'],
  ['/home/z/my-project/public/images/rajtilak-umbrella-act.webp', 'DEP: umbrella'],
  ['/home/z/my-project/public/images/rajtilak-felicitation-hug.webp', 'DEP: hug'],
  ['/home/z/my-project/public/images/certificate-intl-2021.webp', 'DEP: cert-intl'],
  ['/home/z/my-project/public/images/gallery-arvanah.webp', 'DEP: arvanah (unwired)'],
  ['/home/z/my-project/public/images/gallery-closeup-kids.webp', 'DEP: kids (unwired)'],
];

(async () => {
  for (const [f, label] of files) {
    try {
      const m = await sharp(f).metadata();
      const fs = require('fs');
      const kb = (fs.statSync(f).size / 1024).toFixed(0);
      console.log(`${label.padEnd(24)} ${m.width}x${m.height}  ratio=${(m.width / m.height).toFixed(3)}  ${kb}KB`);
    } catch (e) {
      console.log(`${label.padEnd(24)} ERROR: ${e.message}`);
    }
  }
})();
