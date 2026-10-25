"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, KeyRound, Lock, Mail, Loader2, Database, ServerCog, CheckCircle2, AlertTriangle, LineChart, SearchCheck, BadgeDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/admin-client";
import { useSiteCustomization, announceCustomizationChanged } from "@/components/site/customization-provider";

// ─────────────────────────────────────────────────────────────
// Settings → Security + environment.
// The old panel displayed the master password — that public display
// is gone. Credentials now live hashed in the database and are
// rotated from this panel (current password required).
// ─────────────────────────────────────────────────────────────

export function SettingsPanel() {
  const { toast } = useToast();
  const { text } = useSiteCustomization();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);

  // ── Analytics & verification keys (saved as text lines) ──
  const [gaId, setGaId] = useState("");
  const [gscToken, setGscToken] = useState("");
  const [adsenseId, setAdsenseId] = useState("");
  const [keysSaving, setKeysSaving] = useState(false);
  const [keysSaved, setKeysSaved] = useState(false);

  // Prefill from the live customization payload (DB override or default).
  useEffect(() => {
    setGaId(text("seo.ga.measurementId"));
    setGscToken(text("seo.gsc.verificationToken"));
    setAdsenseId(text("seo.adsense.accountId"));
  }, [text]);

  const saveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    const ga = gaId.trim();
    const gsc = gscToken.trim();
    const ads = adsenseId.trim();
    if (ga && !/^G-[A-Za-z0-9]{4,}$/.test(ga)) {
      toast({ title: "Invalid GA4 ID", description: "Format looks like G-XXXXXXXXXX — copy it from Analytics → Admin → Data streams.", variant: "destructive" });
      return;
    }
    if (ads && !/^ca-pub-\d{8,}$/.test(ads)) {
      toast({ title: "Invalid AdSense publisher ID", description: "Format looks like ca-pub-0000000000000000 — copy it from AdSense → Account → Settings.", variant: "destructive" });
      return;
    }
    setKeysSaving(true);
    const res = await adminFetch<{ ok: boolean; count: number }>("/api/admin/texts", {
      method: "PUT",
      body: JSON.stringify({
        updates: [
          { key: "seo.ga.measurementId", value: ga },
          { key: "seo.gsc.verificationToken", value: gsc },
          { key: "seo.adsense.accountId", value: ads },
        ],
      }),
    });
    setKeysSaving(false);
    if (res.ok) {
      setKeysSaved(true);
      announceCustomizationChanged();
      toast({ title: "Keys saved", description: "Analytics + Search Console + AdSense keys are live on the site now." });
    } else {
      toast({ title: "Could not save", description: res.error ?? "Try again.", variant: "destructive" });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast({ title: "Passwords do not match", description: "Re-type the new password in both fields.", variant: "destructive" });
      return;
    }
    if (newPw.length < 10) {
      toast({ title: "Password too short", description: "Use at least 10 characters with upper, lower, a digit and a symbol.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const res = await adminFetch<{ message: string }>("/api/admin/password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword: currentPw,
        newPassword: newPw,
        ...(newEmail.trim() ? { newEmail: newEmail.trim() } : {}),
      }),
    });
    setSaving(false);
    if (res.ok && res.data) {
      setChanged(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setNewEmail("");
      toast({ title: "Credentials updated", description: res.data.message });
    } else {
      toast({ title: "Could not update", description: res.error ?? "Try again.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-[#2a1b3d]">Settings</h1>
        <p className="mt-1 text-sm text-[#5b5266]">
          Master credential rotation and environment notes — everything on one page.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Analytics & verification keys ── */}
        <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3d]">
            <LineChart className="h-4 w-4 text-[#b8923a]" aria-hidden="true" /> Analytics &amp; Verification
          </p>
          <p className="mt-2 text-sm leading-6 text-[#5b5266]">
            Google Analytics 4 measurement ID, the Google Search Console ownership token and
            the Google AdSense publisher ID. Saving writes them straight into the live site — GA
            starts measuring with the new ID immediately, the GSC token renders as the <code className="rounded bg-[#f3ead3] px-1">google-site-verification</code> meta
            tag in raw HTML for Search Console to verify ownership, and the AdSense ID renders as the <code className="rounded bg-[#f3ead3] px-1">google-adsense-account</code> meta
            tag for AdSense to verify and serve ads.
          </p>

          {keysSaved && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#3e8e8a]/40 bg-[#3e8e8a]/10 p-4 text-sm text-[#2a1b3d]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3e8e8a]" aria-hidden="true" />
              <p>Keys saved and live. In Search Console choose “HTML tag” verification, paste the same token, then press Verify. In AdSense the site verifies automatically via the ca-pub meta tag.</p>
            </div>
          )}

          <form onSubmit={saveKeys} className="mt-5 space-y-4">
            <div>
              <Label htmlFor="ga-id" className="text-sm font-semibold text-[#2a1b3d]">
                GA4 Measurement ID <span className="font-normal text-[#5b5266]">(G-XXXXXXXXXX)</span>
              </Label>
              <div className="relative mt-1.5">
                <LineChart className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8923a]" aria-hidden="true" />
                <Input
                  id="ga-id"
                  autoComplete="off"
                  spellCheck={false}
                  value={gaId}
                  onChange={(e) => setGaId(e.target.value)}
                  placeholder="G-103JFH1Z6B"
                  className="h-11 rounded-xl border-[#e3d9c6] bg-[#faf6ee] pl-11 font-mono text-sm text-[#2a1b3d]"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="gsc-token" className="text-sm font-semibold text-[#2a1b3d]">
                Search Console verification token <span className="font-normal text-[#5b5266]">(HTML-tag method)</span>
              </Label>
              <div className="relative mt-1.5">
                <SearchCheck className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8923a]" aria-hidden="true" />
                <Input
                  id="gsc-token"
                  autoComplete="off"
                  spellCheck={false}
                  value={gscToken}
                  onChange={(e) => setGscToken(e.target.value)}
                  placeholder="paste the content=… value from Search Console"
                  className="h-11 rounded-xl border-[#e3d9c6] bg-[#faf6ee] pl-11 font-mono text-sm text-[#2a1b3d]"
                />
              </div>
              <p className="mt-2 text-xs leading-5 text-[#5b5266]">
                Search Console → Add property → URL prefix → https://jadugarrajtilak.com → “HTML tag” →
                copy only the token inside content="…". Paste it here, save, then press Verify in Search Console.
              </p>
            </div>
            <div>
              <Label htmlFor="adsense-id" className="text-sm font-semibold text-[#2a1b3d]">
                AdSense publisher ID <span className="font-normal text-[#5b5266]">(ca-pub-XXXXXXXXXXXXXXXX)</span>
              </Label>
              <div className="relative mt-1.5">
                <BadgeDollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8923a]" aria-hidden="true" />
                <Input
                  id="adsense-id"
                  autoComplete="off"
                  spellCheck={false}
                  value={adsenseId}
                  onChange={(e) => setAdsenseId(e.target.value)}
                  placeholder="ca-pub-8152770887372804"
                  className="h-11 rounded-xl border-[#e3d9c6] bg-[#faf6ee] pl-11 font-mono text-sm text-[#2a1b3d]"
                />
              </div>
              <p className="mt-2 text-xs leading-5 text-[#5b5266]">
                AdSense → Account → Settings → Account information. The ID renders site-wide as the
                google-adsense-account meta tag — AdSense verification and ads.txt checks read it.
              </p>
            </div>
            <Button
              type="submit"
              disabled={keysSaving || (gaId.trim() === text("seo.ga.measurementId") && gscToken.trim() === text("seo.gsc.verificationToken") && adsenseId.trim() === text("seo.adsense.accountId"))}
              className="h-11 w-full rounded-xl bg-[#b3263e] font-semibold hover:bg-[#c2314c]"
            >
              {keysSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Saving…
                </>
              ) : (
                "Save keys to the live site"
              )}
            </Button>
          </form>
        </div>

        {/* ── Security: rotate master credentials ── */}
        <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3d]">
            <KeyRound className="h-4 w-4 text-[#b8923a]" aria-hidden="true" /> Security — change master credentials
          </p>
          <p className="mt-2 text-sm leading-6 text-[#5b5266]">
            Passwords are stored salted and hashed (scrypt) — never in plain text, and never shown
            on any page. Rotating works instantly: the old password stops working the moment you save.
          </p>

          {changed && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#3e8e8a]/40 bg-[#3e8e8a]/10 p-4 text-sm text-[#2a1b3d]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3e8e8a]" aria-hidden="true" />
              <p>Credentials updated. Keep the new password somewhere safe — the studio cannot recover it for you.</p>
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <Label htmlFor="cur-pw" className="text-sm font-semibold text-[#2a1b3d]">Current password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8923a]" aria-hidden="true" />
                <Input
                  id="cur-pw"
                  type="password"
                  autoComplete="current-password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Your current password"
                  required
                  className="h-11 rounded-xl border-[#e3d9c6] bg-[#faf6ee] pl-11 text-[#2a1b3d]"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="new-pw" className="text-sm font-semibold text-[#2a1b3d]">New password</Label>
              <div className="relative mt-1.5">
                <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8923a]" aria-hidden="true" />
                <Input
                  id="new-pw"
                  type="password"
                  autoComplete="new-password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="10+ chars, mixed case, digit, symbol"
                  required
                  className="h-11 rounded-xl border-[#e3d9c6] bg-[#faf6ee] pl-11 text-[#2a1b3d]"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="conf-pw" className="text-sm font-semibold text-[#2a1b3d]">Confirm new password</Label>
              <div className="relative mt-1.5">
                <CheckCircle2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8923a]" aria-hidden="true" />
                <Input
                  id="conf-pw"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Repeat the new password"
                  required
                  className="h-11 rounded-xl border-[#e3d9c6] bg-[#faf6ee] pl-11 text-[#2a1b3d]"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="new-email" className="text-sm font-semibold text-[#2a1b3d]">
                New master email <span className="font-normal text-[#5b5266]">(optional — leave blank to keep the current one)</span>
              </Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8923a]" aria-hidden="true" />
                <Input
                  id="new-email"
                  type="email"
                  autoComplete="off"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="keep current"
                  className="h-11 rounded-xl border-[#e3d9c6] bg-[#faf6ee] pl-11 text-[#2a1b3d]"
                />
              </div>
            </div>
            <Button type="submit" disabled={saving || !currentPw || !newPw || !confirmPw} className="h-11 w-full rounded-xl bg-[#b3263e] font-semibold hover:bg-[#c2314c]">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Updating…
                </>
              ) : (
                "Rotate credentials now"
              )}
            </Button>
          </form>
        </div>

        {/* ── Protection summary ── */}
        <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3d]">
            <ShieldCheck className="h-4 w-4 text-[#3e8e8a]" aria-hidden="true" /> Active protections
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5b5266]">
            <li className="flex items-start gap-3 rounded-xl border border-[#e3d9c6] bg-[#faf6ee] p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#3e8e8a]" aria-hidden="true" />
              <span><strong className="text-[#2a1b3d]">Hashed credentials.</strong> scrypt salted hashes in the database — no plaintext anywhere, no defaults printed on the login page.</span>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-[#e3d9c6] bg-[#faf6ee] p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#3e8e8a]" aria-hidden="true" />
              <span><strong className="text-[#2a1b3d]">Brute-force defence.</strong> 5 wrong sign-ins lock the IP for 10 minutes; 10 wrong passwords lock the account for 30 minutes.</span>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-[#e3d9c6] bg-[#faf6ee] p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#3e8e8a]" aria-hidden="true" />
              <span><strong className="text-[#2a1b3d]">Signed sessions.</strong> 8-hour tokens, HMAC-SHA256, verified on every admin API call.</span>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-[#e3d9c6] bg-[#faf6ee] p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#3e8e8a]" aria-hidden="true" />
              <span><strong className="text-[#2a1b3d]">Hardened headers.</strong> Frame-blocking, MIME sniffing protection, referrer policy and HSTS on every response.</span>
            </li>
          </ul>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#f3ead3]/50 p-4 text-xs leading-5 text-[#5b5266]">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b8923a]" aria-hidden="true" />
            Best practice: rotate the password every few months, never share it in chats or
            screenshots, and sign out (top-left) when working from shared devices.
          </div>
        </div>
      </div>

      {/* ── Environment notes ── */}
      <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3d]">
          <ServerCog className="h-4 w-4 text-[#b8923a]" aria-hidden="true" /> Environment
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5b5266]">
          <li className="flex items-start gap-2">
            <Database className="mt-1 h-4 w-4 shrink-0 text-[#b8923a]" aria-hidden="true" />
            <span><strong className="text-[#2a1b3d]">Database:</strong> Neon Postgres (pooled serverless connection) — leads, messages, availability, blog posts, images, texts, theme, admin credentials and analytics.</span>
          </li>
          <li>• <strong className="text-[#2a1b3d]">Hosting:</strong> Vercel edge network — domain jadugarrajtilak.com with 308 www redirect.</li>
          <li>• <strong className="text-[#2a1b3d]">Measurement:</strong> Google Analytics 4 (G-103JFH1Z6B) + first-party page-view analytics feeding the Analytics tab.</li>
          <li>• <strong className="text-[#2a1b3d]">Media:</strong> uploads stored in Postgres and served from /api/media with immutable caching.</li>
        </ul>
      </div>
    </div>
  );
}
