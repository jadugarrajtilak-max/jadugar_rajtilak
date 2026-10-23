// VLM review of live audit screenshots. Usage: node scripts/liveaudit-vlm.cjs
const ZAI = require('z-ai-web-dev-sdk').default;
const fs = require('fs');

const QUESTIONS = [
  {
    img: 'scripts/liveaudit/mobile-home-top.png',
    q: 'This is the top of a mobile homepage. Describe: 1) Any 3-dot (ellipsis/more) button visible anywhere on the screen edge or side? Where exactly? 2) What does the hero image look like — does the person fit fully inside the frame? 3) Any visual defects.',
  },
  {
    img: 'scripts/liveaudit/desktop-home-full.png',
    q: 'Full desktop homepage screenshot. Describe: 1) The FIRST image at the top (hero portrait) — is it a magician portrait, how is it framed? 2) The SECOND photo (story section with confetti/stage) — is it cropped/cut inside its frame? 3) The THIRD photo (reel poster with microphone) — cropped? 4) List every photo you see with crop state.',
  },
  {
    img: 'scripts/liveaudit/desktop-services-full.png',
    q: 'This is the Shows/Services page. For EACH of the 5 photo cards (wedding, corporate, birthday, college, private): is the photo cut off / cropped badly inside its frame? Which ones show people being cut? Describe each.',
  },
  {
    img: 'scripts/liveaudit/desktop-gallery-full.png',
    q: 'This is the Gallery page. Count the photo frames. Are any photos REPEATED (same photo appearing 2-3 times)? Which ones repeat? Do captions look duplicated too?',
  },
];

(async () => {
  const zai = await ZAI.create();
  const out = [];
  for (const { img, q } of QUESTIONS) {
    const b64 = fs.readFileSync(img).toString('base64');
    try {
      const r = await zai.chat.completions.create({
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } },
            { type: 'text', text: q },
          ],
        }],
      });
      const a = r.choices[0].message.content;
      out.push({ img, q, a });
      console.log(`\n===== ${img} =====\n${a}`);
    } catch (e) {
      console.log(`FAILED ${img}: ${e.message}`);
      out.push({ img, q, error: e.message });
    }
  }
  fs.writeFileSync('scripts/liveaudit/vlm.json', JSON.stringify(out, null, 2));
})();
