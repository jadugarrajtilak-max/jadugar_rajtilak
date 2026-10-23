// VLM visual verification of the v3 gallery + certificates screenshots
const fs = require('fs');

(async () => {
  const ZAI = (await import('z-ai-web-dev-sdk')).default;
  const zai = await ZAI.create();

  const QUESTIONS = [
    {
      img: '/tmp/shot-gallery-wall.png',
      q: 'This is a magician website gallery page (masonry wall). Verify: 1) How many distinct photos are visible? 2) Is any photo REPEATED (same image twice)? 3) Are the photos well-fit inside their frames (no bad cropping of faces/subjects)? 4) Describe each photo in one short phrase.',
    },
    {
      img: '/tmp/shot-gallery-certs.png',
      q: 'This shows a "Certificates & honours" section. Verify: 1) Are there TWO certificate documents displayed? 2) Are they certificate scans (official documents with text/signatures/logos) rather than photos of people? 3) Are they framed nicely (gold frames, caption plates underneath)? 4) Do the captions read sensibly? Describe what you see.',
    },
    {
      img: '/tmp/shot-home-story.png',
      q: 'This is a story section of a magician homepage with a stage photo of a magician with confetti. Verify: 1) Does the photo fit COMPLETELY in its frame (no subject cut off)? 2) Any visual defects?',
    },
  ];

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
      console.log(`\n===== ${img.split('/').pop()} =====`);
      console.log(r.choices[0].message.content);
    } catch (e) {
      console.log(`VLM failed for ${img}: ${e.message}`);
    }
  }
})();
