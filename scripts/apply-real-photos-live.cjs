// Apply the client's real photos + LG certificate text to the LIVE Neon DB.
// Works with BOTH the currently-deployed code (10-frame gallery) and the new
// 5-frame code once deployed:
//  - gallery.item01-05 = the final 5-photo mapping (client's own uploads)
//  - gallery.item06-10 = temporary fills so the live 10-frame gallery shows
//    zero stock photos right now (these keys disappear in the new code)
//  - about.certificate.photo = the LG certificate photo (the "purani image"
//    complaint) + "Felicitated by LG" text rows
//  - about.award.photo = confetti photo (avoids duplicating the cert card)
//  - services.birthday.photo = confetti photo (replaces old stock default)
const { Client } = require('pg');

const URL = process.env.DATABASE_URL;

const M = {
  um1: '/api/media/cmvje080a0001kz07bzbm2rcd', // stage confetti
  um2: '/api/media/cmvje0hqc0002kz07q1uqnban', // mic close-up
  um4: '/api/media/cmvje0zr80004kz07ar00o67p', // umbrella act
  um5: '/api/media/cmvje1ct50005kz07w5pggmw1', // felicitation hug
  um6: '/api/media/cmvje2lwx0006kz0740v3csrp', // LG certificate group photo
};

const ALT = {
  um1: 'Jadugar Rajtilak performing live on stage in his maroon velvet blazer as gold confetti rains down around him',
  um2: 'Close-up of Jadugar Rajtilak speaking into the microphone, black blazer over his yellow shirt',
  um4: 'Jadugar Rajtilak in his shimmering blue suit posing with two black-and-white umbrella stage props',
  um5: 'Jadugar Rajtilak embracing a fellow performer on stage under green lights during a felicitation evening',
  um6: 'Jadugar Rajtilak holding his framed felicitation certificate bearing the LG emblem, flanked by his team and organisers on stage',
};

// key -> media id
const ASSETS = {
  // final 5 (persist across the new code)
  'gallery.item01': M.um1,
  'gallery.item02': M.um2,
  'gallery.item03': M.um4,
  'gallery.item04': M.um5,
  'gallery.item05': M.um6,
  // temporary fills for the live 10-frame layout (keys vanish in new code)
  'gallery.item07': M.um6, // 3:4 frame — exact fit
  'gallery.item09': M.um1, // 1:1 frame — near exact
  // certificate + about + services
  'about.certificate.photo': M.um6,
  'about.award.photo': M.um1,
  'services.birthday.photo': M.um1,
};

const TEXTS = {
  'about.certificate.title': 'Felicitated by LG',
  'about.certificate.detail':
    'Certificate of felicitation presented to Jadugar Rajtilak — recognised on stage by LG',
  // captions matching the photos above (01-05 = final mapping)
  'gallery.item01.caption': 'Confetti night — the stage erupts',
  'gallery.item02.caption': 'Holding the room — every word a spell',
  'gallery.item03.caption': 'The umbrella act — props with a life of their own',
  'gallery.item04.caption': 'Felicitation evening — an embrace from the hosts',
  'gallery.item05.caption': 'Felicitated by LG — the certificate moment',
  // temp captions for live frames 06-10
  'gallery.item06.caption': 'Felicitation evening — an embrace from the hosts',
  'gallery.item07.caption': 'Felicitated by LG — the certificate moment',
  'gallery.item09.caption': 'Confetti night — the stage erupts',
  'gallery.item10.caption': 'Felicitated by LG — the certificate moment',
};

// which media id each caption's photo uses (for alt text)
const CAPTION_MEDIA = {
  'gallery.item01.caption': 'um1',
  'gallery.item02.caption': 'um2',
  'gallery.item03.caption': 'um4',
  'gallery.item04.caption': 'um5',
  'gallery.item05.caption': 'um6',
  'gallery.item06.caption': 'um5',
  'gallery.item07.caption': 'um6',
  'gallery.item09.caption': 'um1',
  'gallery.item10.caption': 'um6',
};

(async () => {
  const client = new Client({ connectionString: URL, connectionTimeoutMillis: 15000 });
  await client.connect();

  for (const [key, src] of Object.entries(ASSETS)) {
    const which = Object.keys(M).find((k) => M[k] === src);
    const alt = ALT[which];
    const r = await client.query(
      `INSERT INTO "SiteAsset" (id, key, src, alt, "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, now())
       ON CONFLICT (key) DO UPDATE SET src = $2, alt = $3, "updatedAt" = now()
       RETURNING key, src`,
      [key, src, alt]
    );
    console.log('asset:', r.rows[0].key, '->', r.rows[0].src);
  }

  for (const [key, value] of Object.entries(TEXTS)) {
    const r = await client.query(
      `INSERT INTO "SiteText" (id, key, value, "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, now())
       ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = now()
       RETURNING key`,
      [key, value]
    );
    console.log('text:', r.rows[0].key, '=', value.slice(0, 60));
  }

  // verify final state
  const assets = await client.query(`SELECT key, src FROM "SiteAsset" ORDER BY key`);
  console.log('\n--- ASSETS (final) ---');
  assets.rows.forEach((r) => console.log(r.key, '->', r.src));
  const texts = await client.query(
    `SELECT key, value FROM "SiteText" WHERE key LIKE 'gallery.item%caption' OR key LIKE 'about.certificate%' ORDER BY key`
  );
  console.log('\n--- TEXTS (final) ---');
  texts.rows.forEach((r) => console.log(r.key, '=', String(r.value).slice(0, 60)));

  await client.end();
})().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
