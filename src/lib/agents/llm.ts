// ─────────────────────────────────────────────────────────────────────
// LLM access for the admin agents, with a portable credential chain:
//
// 1) ENV CONFIG (works on any host): ZAI_BASE_URL + ZAI_API_KEY
//    (optional: ZAI_TOKEN, ZAI_USER_ID, ZAI_CHAT_ID). Set these on
//    Vercel with a public z.ai API key to run LLM agents in production.
// 2) SANDBOX SDK (this workspace only): z-ai-web-dev-sdk reads
//    /etc/.z-ai-config — used automatically when env vars are absent.
//
// When neither is available, calls resolve to null and agents degrade
// gracefully (SEO + Bugfix need no LLM at all).
// ─────────────────────────────────────────────────────────────────────

type ChatMessage = { role: "assistant" | "user"; content: string };

let envMode: "env" | "sdk" | "none" | null = null;

async function completeViaEnv(messages: ChatMessage[]): Promise<string | null> {
  const baseUrl = process.env.ZAI_BASE_URL;
  const apiKey = process.env.ZAI_API_KEY;
  if (!baseUrl || !apiKey) return null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "X-Z-AI-From": "Z",
  };
  if (process.env.ZAI_TOKEN) headers["X-Token"] = process.env.ZAI_TOKEN;
  if (process.env.ZAI_USER_ID) headers["X-User-Id"] = process.env.ZAI_USER_ID;
  if (process.env.ZAI_CHAT_ID) headers["X-Chat-Id"] = process.env.ZAI_CHAT_ID;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 90_000);
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ messages, thinking: { type: "disabled" } }),
      signal: ctl.signal,
    });
    if (!res.ok) throw new Error(`LLM HTTP ${res.status}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? null;
  } finally {
    clearTimeout(t);
  }
}

async function completeViaSdk(messages: ChatMessage[]): Promise<string | null> {
  try {
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });
    return completion.choices[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

/** Single completion with the credential chain. Returns null when no
 *  LLM is reachable (agents treat that as a graceful skip). */
export async function llmComplete(messages: ChatMessage[]): Promise<string | null> {
  // env path first — explicit configuration always wins
  const viaEnv = await completeViaEnv(messages).catch(() => null);
  if (viaEnv) {
    if (envMode !== "env") envMode = "env";
    return viaEnv;
  }
  // sandbox SDK fallback
  const viaSdk = await completeViaSdk(messages);
  if (viaSdk) {
    if (envMode !== "sdk") envMode = "sdk";
    return viaSdk;
  }
  envMode = "none";
  return null;
}

/** JSON-typed completion; parses the first {...} block. null on failure. */
export async function llmJson<T>(system: string, user: string, retries = 1): Promise<T | null> {
  const messages: ChatMessage[] = [
    { role: "assistant", content: system },
    { role: "user", content: user },
  ];
  for (let attempt = 0; attempt <= retries; attempt++) {
    const raw = await llmComplete(messages);
    if (raw) {
      const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start !== -1 && end > start) {
        try {
          return JSON.parse(cleaned.slice(start, end + 1)) as T;
        } catch {
          // fall through to retry
        }
      }
    }
    if (attempt < retries) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
  }
  return null;
}

/** Which LLM mode is active — surfaced in agent reports for transparency. */
export function llmMode(): "env" | "sdk" | "none" {
  return envMode ?? "unknown-yet";
}
