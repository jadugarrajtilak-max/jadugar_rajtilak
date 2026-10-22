// Live E2E for the Blog CMS on production: create → verify → cleanup.
const BASE = 'https://jadugarrajtilak.com';

(async () => {
  // login
  const login = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jadugar.rajtilak@gmail.com', password: process.env.ADMIN_PASSWORD || '' }),
  }).then((r) => r.json());
  if (!login.ok) throw new Error('login failed');
  const key = login.token;

  // create
  const created = await fetch(`${BASE}/api/admin/blog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
    body: JSON.stringify({
      title: 'E2E Live Check — Blog Studio Pipeline',
      slug: 'e2e-live-check-blog-studio',
      metaTitle: 'E2E Live Check — Blog Studio Pipeline',
      metaDescription: 'Verifying create, publish, read, sitemap and delete on production.',
      keywords: 'e2e, blog studio',
      excerpt: 'A temporary entry that proves the whole pipeline works live.',
      category: 'Guides',
      intro: 'Intro with an [internal hyperlink](/packages) for the rich-text renderer.',
      sections: [
        { h: 'Chapter one', paras: ['Paragraph with an [external hyperlink](https://example.com).'] },
        { h: 'Chapter two', paras: ['Plain paragraph for the table of contents.'] },
      ],
      closing: 'Closing note.',
      backlinks: [{ text: 'Backlink partner', url: 'https://partner.example.com' }],
      status: 'published',
    }),
  }).then((r) => r.json());
  console.log('CREATE:', created.ok ? 'OK' : created.error);
  if (!created.ok) process.exit(1);
  const id = created.post.id;

  // public read
  const pub = await fetch(`${BASE}/api/blog/e2e-live-check-blog-studio`).then((r) => r.json());
  console.log('PUBLIC READ:', pub.ok ? 'OK' : 'FAIL', '| metaTitle:', pub.post?.metaTitle?.slice(0, 40));

  // sitemap contains the new post
  const sm = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text());
  console.log('SITEMAP contains post:', sm.includes('e2e-live-check-blog-studio') ? 'OK' : 'FAIL');

  // deep link serves the shell
  const page = await fetch(`${BASE}/blog/e2e-live-check-blog-studio`);
  console.log('DEEP LINK /blog/<slug>:', page.status === 200 ? 'OK' : `FAIL ${page.status}`);

  // delete
  const del = await fetch(`${BASE}/api/admin/blog/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': key },
  }).then((r) => r.json());
  console.log('DELETE:', del.ok ? 'OK' : del.error);

  // gone from public
  const gone = await fetch(`${BASE}/api/blog/e2e-live-check-blog-studio`);
  console.log('REMOVED FROM PUBLIC:', gone.status === 404 ? 'OK' : `FAIL ${gone.status}`);

  const smAfter = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text());
  console.log('SITEMAP cleaned:', !smAfter.includes('e2e-live-check-blog-studio') ? 'OK' : 'FAIL');
})().catch((e) => {
  console.error('E2E FAILED:', e.message);
  process.exit(1);
});
