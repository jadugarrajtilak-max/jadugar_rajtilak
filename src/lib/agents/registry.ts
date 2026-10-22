// ─────────────────────────────────────────────────────────────────────
// Agent registry — identity, cadence and helper metadata for the four
// Master Admin agents. The heavy lifting lives in ./tasks.ts.
// ─────────────────────────────────────────────────────────────────────
import type { AgentId } from "./skills";

export type AgentMeta = {
  id: AgentId;
  name: string;
  hindi: string;
  role: string;
  cadence: string;
  /** IST hour of day when the scheduler may fire this agent */
  scheduleHour: number; // 0-23 IST
  /** only run on Mondays (IST) when true */
  weeklyOnly?: boolean;
  accent: string;
};

export const AGENTS: AgentMeta[] = [
  {
    id: "rank",
    name: "Rank Agent",
    hindi: "रैंक एजेंट",
    role: "White-hat backlinks, DA/PA growth, outreach drafts — zero spam. Tracks the 15-source pipeline from the 90-day roadmap.",
    cadence: "Weekly (Mon 10:30 IST) + manual",
    scheduleHour: 10,
    weeklyOnly: true,
    accent: "#b8923a",
  },
  {
    id: "seo",
    name: "SEO Specialist",
    hindi: "एसईओ स्पेशलिस्ट",
    role: "Audits the live site daily: routes, titles, canonicals, sitemap, schema, GA/GSC, keywords — reports every issue with exact fixes.",
    cadence: "Daily (10:00 IST) + manual",
    scheduleHour: 10,
    accent: "#1B7D46",
  },
  {
    id: "bugfix",
    name: "Bug Fixer",
    hindi: "बग फिक्सर",
    role: "24×7 health watch: route/API errors, security headers, admin-gate integrity, DB connectivity. Read-only — never touches business data.",
    cadence: "Daily (08:00 IST) + manual",
    scheduleHour: 8,
    accent: "#C0392B",
  },
  {
    id: "blog",
    name: "Blog Writer",
    hindi: "ब्लॉग राइटर",
    role: "One SEO-friendly blog draft every day from the Content Calendar. Saves as draft for your approval — existing posts are never touched.",
    cadence: "Daily (09:15 IST) + manual",
    scheduleHour: 9,
    accent: "#4c3a75",
  },
];

export function agentById(id: string): AgentMeta | undefined {
  return AGENTS.find((a) => a.id === id);
}

// IST offset from UTC in minutes (India Standard Time, no DST)
const IST_OFFSET_MIN = 330;

export function nowIst(): { hour: number; date: string; dow: number } {
  const now = new Date(Date.now() + IST_OFFSET_MIN * 60_000);
  return {
    hour: now.getUTCHours(),
    date: now.toISOString().slice(0, 10), // YYYY-MM-DD in IST
    dow: now.getUTCDay(), // 0=Sun … 1=Mon
  };
}
