// Full admin CRM flow verification on isolated local server
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // ── login through the real UI ──
  await page.goto("http://localhost:3999/admin", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1500);

  const loginSnapshot = await page.evaluate(() => ({
    hasEmailField: !!document.querySelector('input[type="email"], input[name="email"]'),
    hasPassField: !!document.querySelector('input[type="password"], input[name="password"]'),
    bodyText: document.body.innerText.slice(0, 150),
  }));
  console.log("LOGIN GATE:", JSON.stringify(loginSnapshot));

  await page.fill('input[type="email"], input[name="email"]', "test@local.dev");
  await page.fill('input[type="password"], input[name="password"]', "TestCrm@2026");
  await page.click('button[type="submit"], form button');
  // wait until the admin shell replaces the login gate (Verifying… disappears)
  await page.waitForFunction(() => !document.body.innerText.includes("Verifying"), { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);

  // ── go to Leads tab ──
  const leadsTab = await page.$('nav[aria-label="Admin sections"] button:has-text("Leads"), nav button:has-text("Leads")');
  if (leadsTab) { await leadsTab.click(); await page.waitForTimeout(1500); }
  else {
    // fallback: click any button whose text matches Leads
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((x) => /leads/i.test(x.textContent || ""));
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
  }

  const crm = await page.evaluate(() => {
    const kpis = Array.from(document.querySelectorAll("main .grid > div")).slice(0, 8).map((d) => d.textContent?.slice(0, 60));
    const kanbanCols = Array.from(document.querySelectorAll('[aria-label="Lead pipeline columns"] > div')).map((c) => ({
      label: c.querySelector("p")?.textContent?.trim(),
      count: c.querySelector("span")?.textContent?.trim(),
    }));
    const cards = document.querySelectorAll('[role="listitem"]');
    return {
      heading: document.querySelector("h1")?.textContent,
      kpiCount: document.querySelectorAll(".font-display.text-3xl").length,
      kpiValues: Array.from(document.querySelectorAll(".font-display.text-3xl")).map((e) => e.textContent),
      kanbanCols,
      leadCards: cards.length,
      toolbarButtons: Array.from(document.querySelectorAll("header ~ div button, main button")).map((b) => b.textContent?.trim()).filter((t) => t && t.length < 25).slice(0, 12),
    };
  });
  console.log("CRM KANBAN:", JSON.stringify(crm, null, 2));
  await page.screenshot({ path: "/home/z/my-project/scripts/shot-crm-kanban.png", fullPage: false });

  // ── open a lead detail dialog ──
  await page.evaluate(() => {
    const card = document.querySelector('[role="listitem"] button');
    if (card) card.click();
  });
  await page.waitForTimeout(1200);
  const dialog = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg) return { open: false };
    const links = Array.from(dlg.querySelectorAll("a")).map((a) => ({ text: a.textContent?.trim(), href: a.getAttribute("href")?.slice(0, 80) }));
    const hasLostReason = !!dlg.textContent?.includes("Pipeline stage");
    return { open: true, links, fields: (dlg.querySelectorAll("dt")?.length ?? 0), hasNotes: dlg.textContent?.includes("Client notes") };
  });
  console.log("LEAD DIALOG:", JSON.stringify(dialog, null, 2));
  await page.screenshot({ path: "/home/z/my-project/scripts/shot-crm-dialog.png" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);

  // ── table view ──
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const b = btns.find((x) => /table/i.test(x.textContent || ""));
    if (b) b.click();
  });
  await page.waitForTimeout(1000);
  const table = await page.evaluate(() => {
    const rows = document.querySelectorAll("tbody tr");
    const firstRow = rows[0];
    return {
      rowCount: rows.length,
      headers: Array.from(document.querySelectorAll("thead th")).map((t) => t.textContent?.trim()),
      firstRowCells: firstRow ? Array.from(firstRow.querySelectorAll("td")).map((t) => t.textContent?.trim().slice(0, 30)) : null,
      whatsappLinks: document.querySelectorAll('tbody a[href*="wa.me"]').length,
    };
  });
  console.log("CRM TABLE:", JSON.stringify(table, null, 2));
  await page.screenshot({ path: "/home/z/my-project/scripts/shot-crm-table.png" });

  // ── mobile check ──
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  const mobile = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  console.log("CRM MOBILE overflow:", JSON.stringify(mobile));

  await browser.close();
  console.log("ADMIN CRM VERIFICATION DONE");
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
