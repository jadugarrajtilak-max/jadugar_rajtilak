// Verify the blog agent's template fallback produces valid, substantial
// posts for English + Hindi topics (the "Needs attention" fix path).
import { templatePost } from "../src/lib/agents/tasks";

const cases = [
  { title: "Magician in Jodhpur: Booking Guide for Weddings & Events", keyword: "magician in jodhpur", category: "City Guides" },
  { title: "जादूगर उदयपुर: शादी के लिए मैजिक शो बुक करने की पूरी गाइड", keyword: "जादूगर उदयपुर", category: "Hindi" },
];

let fail = 0;
for (const t of cases) {
  const p = templatePost(t as never);
  const words = (p.intro + " " + p.sections.flatMap((s) => s.paras).join(" ") + " " + (p.closing ?? "")).split(/\s+/).length;
  const checks = {
    title: p.title === t.title,
    sections: p.sections.length >= 5,
    parasPerSection: p.sections.every((s) => s.paras.length >= 1 && s.paras.join(" ").length > 60),
    wordCount: words >= 350,
    faq: p.sections.some((s) => /Q:/.test(s.h) || s.paras.some((x) => x.startsWith("Q:"))),
    introHasKeyword: p.intro.includes(t.keyword.split(" ")[0]),
    internalLinks: JSON.stringify(p.sections).includes("jadugarrajtilak.com"),
    closing: (p.closing ?? "").length > 20,
  };
  const bad = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  console.log(`\n[${t.category}] "${t.title.slice(0, 40)}"`);
  console.log(`  sections=${p.sections.length} words≈${words} — ${bad.length === 0 ? "ALL CHECKS PASS" : "FAILED: " + bad.join(", ")}`);
  if (bad.length) fail++;
}
console.log(fail === 0 ? "\nTEMPLATE FALLBACK: PASS" : "\nTEMPLATE FALLBACK: FAIL");
process.exit(fail === 0 ? 0 : 1);
