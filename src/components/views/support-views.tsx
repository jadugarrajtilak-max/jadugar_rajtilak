"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Clock, Phone, Mail, MessageCircle, MapPin, Send, Loader2, Sparkles, Wand2, Search, BookOpen, Feather, PenLine, Star, MoonStar, CheckCircle2, X, Cake, Heart, Briefcase, GraduationCap, Facebook, Twitter, Linkedin, Copy, Check, List } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal, SectionHeading } from "@/components/home/sections";
import { BLOG_POSTS, FAQS, FAQ_CATS, SITE, type RouteId } from "@/lib/content";
import { trackEvent, trackPageView } from "@/lib/router";
import { useSiteCustomization } from "@/components/site/customization-provider";
import { useToast } from "@/hooks/use-toast";

function PageHero({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <header className="relative overflow-hidden border-b border-[var(--jr-line)] bg-[var(--jr-sand)] pb-16 pt-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50"
        style={{
          background: "radial-gradient(70% 90% at 50% -20%, color-mix(in srgb, var(--jr-gold) 18%, transparent), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display mt-3 text-display-lg font-medium text-[var(--jr-plum)]">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-body-lg text-[var(--jr-ink)]">{sub}</p>
      </div>
    </header>
  );
}

// ── Blog / Journal (doc 6 + 10.3 topics) ──

// Green-room margin notes — the magician's own aphorisms, pinned above
// the desk between shows. Brand voice, not reviews (doc rule holds).
const GREEN_ROOM_NOTES = [
  {
    no: "№ 112",
    text: "The audience never remembers the trick. They remember how it felt to be fooled.",
    tilt: "-1.6deg",
  },
  {
    no: "№ 078",
    text: "A stage is borrowed for an evening. The gasp is yours to keep.",
    tilt: "1.2deg",
  },
  {
    no: "№ 143",
    text: "Rehearse until the impossible looks careless.",
    tilt: "-0.8deg",
  },
];

// The Midnight Dispatch — a real subscribe that lands in the admin inbox
// (ContactMessage row via /api/contact), so every signup is saved data.
function MidnightDispatch() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast({ title: "Your name, please", description: "Two characters or more — even a stage name works.", variant: "destructive" });
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast({ title: "That email looks shy", description: "Check the address — the dispatch cannot find an incomplete one.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: `Midnight Dispatch subscription request from the Journal page — please add ${email} to the monthly letter.`,
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setDone(true);
        toast({
          title: "The owl has flown",
          description: "Your dispatch request is saved — it lands in the studio inbox and you will hear from us.",
        });
      } else {
        toast({
          title: "The ink smudged",
          description: json?.error ?? "Please try again in a moment.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Please check your connection and try once more.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--jr-gold)]/30 bg-[var(--jr-plum-deep)] p-8 sm:p-10">
      <div aria-hidden="true" className="stage-light absolute -top-20 right-1/4 h-[75%] w-[40%] opacity-25" />
      <div className="relative grid items-center gap-8 lg:grid-cols-[auto_1fr]">
        {/* the moon sigil */}
        <div className="mx-auto text-center">
          <span className="animate-orb-swirl relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[var(--jr-gold)]/40 bg-[radial-gradient(circle_at_35%_30%,color-mix(in_srgb,var(--jr-gold-light)_30%,transparent),transparent_60%)]">
            <MoonStar className="h-9 w-9 text-[var(--jr-gold-light)]" aria-hidden="true" />
            <span aria-hidden="true" className="animate-orb-ring absolute inset-0 rounded-full border border-[var(--jr-gold)]/30" />
          </span>
          <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-[var(--jr-lavender)]/60">sent at the</p>
          <p className="font-display text-sm font-semibold text-[var(--jr-gold-light)]">stroke of midnight</p>
        </div>
        <div>
          <p className="eyebrow text-[var(--jr-gold-light)]">The Midnight Dispatch</p>
          <h3 className="font-display mt-2 text-3xl font-medium text-[var(--jr-ivory)]">
            One letter a month. Written after the last show, sent before the first.
          </h3>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-[var(--jr-lavender)]/85">
            Behind-the-scenes notes from touring evenings, the honest pricing conversations this
            Journal keeps having, and first access to newly released dates each season. No spam, no
            borrowed lists — the studio writes it personally and you can leave with one reply.
          </p>
          {done ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[var(--jr-teal)]/40 bg-[color-mix(in_srgb,var(--jr-teal)_12%,var(--jr-plum-deep))] px-5 py-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--jr-teal)]" aria-hidden="true" />
              <p className="text-sm leading-6 text-[var(--jr-ivory)]">
                Request saved — <span className="font-semibold">{email}</span> is with the studio. The
                first dispatch arrives with the next full moon (or thereabouts).
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row" noValidate>
              <label className="sr-only" htmlFor="dispatch-name">Your name</label>
              <input
                id="dispatch-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="min-h-11 flex-1 rounded-full border border-[var(--jr-gold)]/30 bg-[var(--jr-plum)]/60 px-5 text-[15px] text-[var(--jr-ivory)] placeholder:text-[var(--jr-lavender)]/50 focus:border-[var(--jr-gold)] focus:outline-none"
              />
              <label className="sr-only" htmlFor="dispatch-email">Your email</label>
              <input
                id="dispatch-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="min-h-11 flex-1 rounded-full border border-[var(--jr-gold)]/30 bg-[var(--jr-plum)]/60 px-5 text-[15px] text-[var(--jr-ivory)] placeholder:text-[var(--jr-lavender)]/50 focus:border-[var(--jr-gold)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--jr-crimson)] px-7 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)] disabled:opacity-60"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                {sending ? "Sealing the envelope…" : "Send me the letter"}
              </button>
            </form>
          )}
          <p className="mt-3 text-[11px] leading-5 text-[var(--jr-lavender)]/55">
            Subscribing saves your request to the studio&apos;s inbox — the same place every enquiry
            lands. Nothing is shared, ever.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Rich text: [label](url) inline hyperlinks inside paragraphs ──
// Admins write markdown-style links in the Blog Studio; the reader
// turns them into real, crawlable <a> elements. Internal links
// (starting with /) stay same-tab; external links open safely.
const RICH_LINK_RE = /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/g;

function RichPara({ text, className }: { text: string; className?: string }) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  RICH_LINK_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RICH_LINK_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const href = m[2];
    const internal = href.startsWith("/");
    nodes.push(
      <a
        key={`lk-${key++}`}
        href={href}
        {...(internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        className="font-semibold text-[var(--jr-crimson)] underline decoration-[var(--jr-gold)]/60 decoration-2 underline-offset-4 transition-colors hover:text-[var(--jr-plum)] hover:decoration-[var(--jr-crimson)]"
      >
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <p className={className}>{nodes}</p>;
}

// ── Per-post SEO: <title>, meta, canonical, OG + Article JSON-LD ──
// Rendered inside the reader tree — React 19 hoists them into <head>
// and removes them on close, so every /blog/<slug> deep link carries
// its own title, snippet, canonical and social card.
function ArticleSeoTags({ post }: { post: ClientPost }) {
  const url = `https://jadugarrajtilak.com/blog/${post.slug}`;
  const title = post.metaTitle?.trim() || post.title;
  const desc = post.metaDescription?.trim() || post.excerpt;
  const ogImage = post.featuredImage
    ? `https://jadugarrajtilak.com${post.featuredImage}`
    : "https://jadugarrajtilak.com/images/hero-portrait-v2.jpg";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: desc,
    image: [ogImage],
    author: { "@type": "Person", name: post.author || "Jadugar Rajtilak" },
    publisher: {
      "@type": "Organization",
      name: "Jadugar Rajtilak",
      logo: { "@type": "ImageObject", url: "https://jadugarrajtilak.com/images/logo-full-v2.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "en-IN",
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      {post.keywords ? <meta name="keywords" content={post.keywords} /> : null}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="article" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Jadugar Rajtilak" />
      <meta property="article:author" content={post.author || "Jadugar Rajtilak"} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

// ── Share row — WhatsApp / Facebook / X / LinkedIn / copy link ──
function ShareRow({ title, slug, vertical }: { title: string; slug: string; vertical?: boolean }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const url = `https://jadugarrajtilak.com/blog/${slug}`;
  const encUrl = encodeURIComponent(url);
  const encText = encodeURIComponent(title);

  const nets = [
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${encText}%20${encUrl}`, icon: MessageCircle },
    { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`, icon: Facebook },
    { id: "x", label: "X (Twitter)", href: `https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`, icon: Twitter },
    { id: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`, icon: Linkedin },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackEvent("share_click", { network: "copy", page: url });
      toast({ title: "Link copied", description: "The article address is on your clipboard." });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast({ title: "Could not copy", description: `Long-press and copy: ${url}`, variant: "destructive" });
    }
  };

  return (
    <div className={vertical ? "flex flex-col gap-2.5" : "flex flex-wrap items-center justify-center gap-2.5"}>
      {nets.map((n) => (
        <a
          key={n.id}
          href={n.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("share_click", { network: n.id, page: url })}
          aria-label={`Share on ${n.label}`}
          title={`Share on ${n.label}`}
          className="inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-[var(--jr-gold)]/40 bg-[color-mix(in_srgb,var(--jr-plum)_60%,transparent)] px-3.5 py-2 text-[var(--jr-cream)] transition-all duration-400 hover:-translate-y-0.5 hover:border-[var(--jr-gold)] hover:bg-[var(--jr-gold)]/15"
        >
          <n.icon className="h-4 w-4" aria-hidden="true" />
          {vertical ? <span className="text-xs font-semibold">{n.label}</span> : null}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Copy article link"
        title="Copy article link"
        className="inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-[var(--jr-gold)]/40 bg-[color-mix(in_srgb,var(--jr-plum)_60%,transparent)] px-3.5 py-2 text-[var(--jr-cream)] transition-all duration-400 hover:-translate-y-0.5 hover:border-[var(--jr-gold)] hover:bg-[var(--jr-gold)]/15"
      >
        {copied ? <Check className="h-4 w-4 text-[var(--jr-teal)]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        {vertical ? <span className="text-xs font-semibold">{copied ? "Copied!" : "Copy link"}</span> : null}
      </button>
    </div>
  );
}

// ── The Reading Room — full-article overlay ──
// The Journal's entries are published pieces: clicking one opens the
// complete article in an immersive reader (ESC to close, body scroll
// locked) with an auto table of contents, reading progress bar,
// featured image + alt, inline hyperlinks, backlink references,
// share buttons and a get-a-quote CTA. The URL becomes
// /blog/<slug> so the article is shareable and indexable.
function ArticleReader({
  post,
  onClose,
  navigate,
}: {
  post: ClientPost;
  onClose: () => void;
  navigate: (r: RouteId) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Deterministic tab title — the article's SEO title takes over the
  // browser tab while reading, and the route title is restored on close.
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${post.metaTitle?.trim() || post.title} — Jadugar Rajtilak`;
    return () => {
      document.title = prevTitle;
    };
  }, [post]);

  const onOverlayScroll = () => {
    const el = overlayRef.current;
    if (!el) return;
    const total = el.scrollHeight - el.clientHeight;
    setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0);
  };

  const jumpTo = (i: number) => {
    setTocOpen(false);
    document.getElementById(`chapter-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const quoteCta = () => trackEvent("quote_cta_click", { page: `/blog/${post.slug}` });

  return (
    <div
      ref={overlayRef}
      onScroll={onOverlayScroll}
      className="fixed inset-0 z-[70] overflow-y-auto bg-[color-mix(in_srgb,var(--jr-plum-deep)_92%,black)] backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`Reading: ${post.title}`}
    >
      {/* reading progress */}
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[80] h-1">
        <div
          className="h-full bg-gradient-to-r from-[var(--jr-gold)] via-[var(--jr-gold-light)] to-[var(--jr-crimson)] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* per-post SEO */}
      <ArticleSeoTags post={post} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* sticky control bar */}
        <div className="sticky top-0 z-20 -mx-4 mb-8 flex items-center justify-between gap-4 border-b border-[var(--jr-gold)]/20 bg-[color-mix(in_srgb,var(--jr-plum-deep)_85%,transparent)] px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
          <span className="eyebrow text-[var(--jr-gold-light)]">The Reading Room</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTocOpen((t) => !t)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--jr-gold)]/40 px-4 py-2 text-sm font-semibold text-[var(--jr-ivory)] transition-colors hover:bg-[var(--jr-gold)]/15 lg:hidden"
              aria-expanded={tocOpen}
            >
              <List className="h-4 w-4" aria-hidden="true" /> Contents
            </button>
            <button
              onClick={onClose}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--jr-gold)]/40 px-5 py-2 text-sm font-semibold text-[var(--jr-ivory)] transition-colors hover:bg-[var(--jr-gold)]/15"
            >
              <X className="h-4 w-4" aria-hidden="true" /> Close <span className="hidden text-[11px] font-normal text-[var(--jr-lavender)]/60 sm:inline">(Esc)</span>
            </button>
          </div>
        </div>

        {/* mobile TOC */}
        {tocOpen && (
          <nav aria-label="Table of contents" className="mb-6 rounded-2xl border border-[var(--jr-gold)]/30 bg-[color-mix(in_srgb,var(--jr-plum)_55%,var(--jr-plum-deep))] p-5 lg:hidden">
            <p className="eyebrow text-[var(--jr-gold-light)]">In this entry</p>
            <ol className="mt-3 space-y-2">
              {post.sections.map((s, i) => (
                <li key={s.h}>
                  <button
                    onClick={() => jumpTo(i)}
                    className="flex items-start gap-2.5 text-left text-sm leading-6 text-[var(--jr-lavender)] transition-colors hover:text-[var(--jr-ivory)]"
                  >
                    <span className="font-display shrink-0 text-xs font-semibold text-[var(--jr-gold)]">{String(i + 1).padStart(2, "0")}</span>
                    {s.h}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          {/* the printed page */}
          <article className="relative overflow-hidden rounded-3xl border border-[var(--jr-gold)]/30 bg-[var(--jr-cream)] shadow-[0_50px_120px_-50px_color-mix(in_srgb,var(--jr-plum)_80%,transparent)]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--jr-gold)] via-[var(--jr-crimson)] to-[var(--jr-gold)]" />
            <div className="px-6 pb-10 pt-10 sm:px-12 sm:pb-14 sm:pt-14">
              {/* masthead */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--jr-gold-dark)]">
                <span className="rounded-full border border-[var(--jr-gold)]/40 bg-[var(--jr-sand-light)]/70 px-3.5 py-1">{post.category}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> {post.readingTime} read</span>
                <span>{post.date}</span>
              </div>
              {/* The article's single H1 — proper heading hierarchy for
                  SEO (page hero is unmounted while reading, so there is
                  exactly one H1 on /blog/<slug>). */}
              <h1 className="font-display mt-6 text-3xl font-semibold leading-tight text-[var(--jr-plum)] sm:text-4xl">
                {post.title}
              </h1>
              <p className="mt-4 flex items-center gap-2 text-sm text-[var(--jr-ink)]/80">
                <Feather className="h-4 w-4 text-[var(--jr-gold-dark)]" aria-hidden="true" />
                Written by {post.author || "Jadugar Rajtilak"}, from the studio desk in Udaipur
              </p>

              {/* featured image with SEO alt text */}
              {post.featuredImage ? (
                <figure className="mt-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.featuredImage}
                    alt={post.featuredImageAlt || post.title}
                    className="w-full rounded-2xl border border-[var(--jr-line)] object-cover shadow-[0_30px_60px_-35px_color-mix(in_srgb,var(--jr-plum)_60%,transparent)]"
                  />
                  {post.featuredImageAlt ? (
                    <figcaption className="mt-2.5 text-center text-[11px] italic leading-5 text-[var(--jr-ink)]/70">
                      {post.featuredImageAlt}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}

              <div aria-hidden="true" className="mt-8 flex items-center gap-3">
                <span className="h-px flex-1 bg-[var(--jr-line)]" />
                <span className="text-[var(--jr-gold)]">♠</span>
                <span className="h-px flex-1 bg-[var(--jr-line)]" />
              </div>

              {/* intro with drop cap */}
              {post.intro ? (
                <RichPara
                  className="jr-article mt-8 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.75] first-letter:text-[var(--jr-crimson)] text-[15.5px] leading-8 text-[var(--jr-ink)]"
                  text={post.intro}
                />
              ) : null}

              {/* chapters — each heading is a TOC anchor */}
              <div className="mt-10 space-y-10">
                {post.sections.map((s, i) => (
                  <section key={s.h} id={`chapter-${i}`} className="scroll-mt-24">
                    <h2 className="flex items-baseline gap-3 font-display text-xl font-semibold text-[var(--jr-plum)] sm:text-[22px]">
                      <span className="font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--jr-gold)]/45 bg-[var(--jr-sand-light)]/70 text-sm font-semibold text-[var(--jr-gold-dark)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.h}
                    </h2>
                    <div className="mt-4 space-y-4 pl-0 sm:pl-11">
                      {s.paras.map((p, j) => (
                        <RichPara key={j} className="jr-article text-[15.5px] leading-8 text-[var(--jr-ink)]" text={p} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {/* closing note */}
              {post.closing ? (
                <div className="mt-12 rounded-2xl border border-[var(--jr-gold)]/35 bg-[var(--jr-sand-light)]/45 p-6 sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--jr-gold-dark)]">Before you close the page</p>
                  <RichPara className="jr-article mt-3 text-[15.5px] leading-8 text-[var(--jr-ink)]" text={post.closing} />
                </div>
              ) : null}

              {/* backlinks — crawlable references, visible by design */}
              {post.backlinks && post.backlinks.length > 0 ? (
                <nav aria-label="References and further reading" className="mt-8 rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-sand-light)]/30 p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--jr-gold-dark)]">References &amp; further reading</p>
                  <ul className="mt-3 space-y-2">
                    {post.backlinks.map((b) => (
                      <li key={b.url} className="flex items-start gap-2 text-[13px] leading-6">
                        <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--jr-gold)]" />
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--jr-ink)] underline decoration-[var(--jr-gold)]/50 underline-offset-4 transition-colors hover:text-[var(--jr-crimson)]"
                        >
                          {b.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}

              {/* share + quote CTA */}
              <div className="mt-10 rounded-2xl border border-[var(--jr-gold)]/35 bg-gradient-to-b from-[var(--jr-plum)] to-[var(--jr-plum-deep)] p-6 text-center sm:p-8">
                <p className="eyebrow text-[var(--jr-gold-light)]">Enjoyed the read?</p>
                <p className="font-display mx-auto mt-2 max-w-md text-xl font-medium leading-8 text-[var(--jr-ivory)]">
                  Share it with someone planning an evening — or get a written quote for your own.
                </p>
                <div className="mt-5">
                  <ShareRow title={post.title} slug={post.slug} />
                </div>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    onClick={() => {
                      quoteCta();
                      navigate("booking");
                    }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-7 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)]"
                  >
                    <Wand2 className="h-4 w-4" aria-hidden="true" /> Get a written quote
                  </button>
                  <a
                    href={`https://wa.me/${SITE.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={quoteCta}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--jr-gold)]/60 px-7 py-3 text-[15px] font-semibold text-[var(--jr-cream)] transition-colors hover:bg-[var(--jr-gold)]/15"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp the studio
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* desktop sidebar: TOC + share */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <nav aria-label="Table of contents" className="rounded-2xl border border-[var(--jr-gold)]/30 bg-[color-mix(in_srgb,var(--jr-plum)_55%,var(--jr-plum-deep))] p-5">
                <p className="eyebrow text-[var(--jr-gold-light)]">In this entry</p>
                <ol className="mt-3 space-y-2.5">
                  {post.sections.map((s, i) => (
                    <li key={s.h}>
                      <button
                        onClick={() => jumpTo(i)}
                        className="flex items-start gap-2.5 text-left text-[13px] leading-6 text-[var(--jr-lavender)] transition-colors hover:text-[var(--jr-ivory)]"
                      >
                        <span className="font-display shrink-0 text-xs font-semibold text-[var(--jr-gold)]">{String(i + 1).padStart(2, "0")}</span>
                        {s.h}
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 border-t border-[var(--jr-gold)]/20 pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--jr-gold-light)]">Share this entry</p>
                  <div className="mt-3">
                    <ShareRow title={post.title} slug={post.slug} vertical />
                  </div>
                </div>
              </nav>
            </div>
          </aside>
        </div>

        <p className="mt-6 pb-4 text-center text-xs text-[var(--jr-lavender)]/60">
          Press Esc, or tap Close, to return to the Blog.
        </p>
      </div>
    </div>
  );
}

// ── Client-side post shape — DB posts and static fallback unified ──
type ClientPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  keywords: string;
  date: string;
  outline: string[];
  intro: string;
  sections: { h: string; paras: string[] }[];
  closing: string;
  featured: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  backlinks?: { text: string; url: string }[];
  author?: string;
};

export function BlogView({ navigate, initialSlug }: { navigate: (r: RouteId) => void; initialSlug?: string | null }) {
  const { text } = useSiteCustomization();
  const [cat, setCat] = useState("All");
  const [readingSlug, setReadingSlug] = useState<string | null>(null);
  const [apiPosts, setApiPosts] = useState<ClientPost[] | null>(null);

  // Published posts live in the CMS (Neon Postgres). The static array is
  // only a first-paint fallback — the moment /api.blog answers, the DB
  // list (including newly written entries) takes over.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/blog")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled || !j?.ok || !Array.isArray(j.posts) || j.posts.length === 0) return;
        setApiPosts(
          j.posts.map(
            (p: {
              slug: string; title: string; excerpt: string; category: string;
              readingTime: string; keywords: string | null; publishedAt: string;
              intro: string; sections: { h: string; paras: string[] }[]; closing: string;
              featured: boolean; metaTitle: string | null; metaDescription: string | null;
              featuredImage: string | null; featuredImageAlt: string | null;
              backlinks: { text: string; url: string }[]; author: string;
            }) => ({
              slug: p.slug,
              title: p.title,
              excerpt: p.excerpt,
              category: p.category,
              readingTime: p.readingTime,
              keywords: p.keywords ?? "",
              date: p.publishedAt,
              outline: p.sections.map((s) => s.h),
              intro: p.intro,
              sections: p.sections,
              closing: p.closing,
              featured: p.featured,
              metaTitle: p.metaTitle,
              metaDescription: p.metaDescription,
              featuredImage: p.featuredImage,
              featuredImageAlt: p.featuredImageAlt,
              backlinks: p.backlinks,
              author: p.author,
            })
          )
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const posts: ClientPost[] = useMemo(() => {
    if (apiPosts) return apiPosts;
    return BLOG_POSTS.map((p, i) => ({
      slug: p.slug,
      title: text(`blog.post${i + 1}.title`) || p.title,
      excerpt: text(`blog.post${i + 1}.excerpt`) || p.excerpt,
      category: p.category,
      readingTime: p.readingTime,
      keywords: p.keywords,
      date: p.date,
      outline: p.outline,
      intro: p.body.intro,
      sections: p.body.sections,
      closing: p.body.closing,
      featured: p.featured ?? false,
    }));
  }, [apiPosts, text]);

  // Deep links: /blog/<slug> opens the article directly.
  useEffect(() => {
    if (initialSlug && !readingSlug && posts.some((p) => p.slug === initialSlug)) {
      setReadingSlug(initialSlug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug, posts]);

  // Back/forward: sync the overlay with the URL.
  useEffect(() => {
    const onPop = () => {
      const seg = window.location.pathname.split("/")[2];
      const slug = seg && posts.some((p) => p.slug === seg) ? seg : null;
      setReadingSlug(slug);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [posts]);

  const reading = readingSlug ? posts.find((p) => p.slug === readingSlug) ?? null : null;

  // Cards act as buttons that open the Reading Room (keyboard included).
  const cardKey = (e: React.KeyboardEvent, slug: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPost(slug);
    }
  };

  const openPost = (slug: string) => {
    setReadingSlug(slug);
    const path = `/blog/${slug}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
      trackPageView(path);
    }
  };

  const closeReader = () => {
    setReadingSlug(null);
    if (window.location.pathname.startsWith("/blog/") || window.location.pathname.startsWith("/journal/")) {
      window.history.pushState(null, "", "/blog");
      trackPageView("/blog");
    }
  };

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts]
  );

  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter(
    (p) => featured && p.slug !== featured.slug && (cat === "All" || p.category === cat)
  );
  const featuredVisible = cat === "All" || (featured && featured.category === cat);

  return (
    <div>
      {/* While an article is open the index unmounts — exactly one H1
          lives on /blog/<slug> (the article title) and the DOM stays
          light under the fixed Reading-Room overlay. */}
      {!reading && (
        <>
      <PageHero
        eyebrow={text("blog.hero.eyebrow")}
        title={text("blog.hero.title")}
        sub={text("blog.hero.sub")}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {/* ── The featured reading — the desk's current obsession ── */}
        {featuredVisible && featured && (
          <Reveal>
            <article
              className="card-cine group relative cursor-pointer overflow-hidden rounded-3xl border border-[var(--jr-gold)]/50 bg-[var(--jr-card)] shadow-[0_35px_70px_-40px_color-mix(in_srgb,var(--jr-gold)_45%,transparent)] transition-transform duration-500 hover:-translate-y-1"
              tabIndex={0}
              role="button"
              aria-label={`Read the full entry: ${featured.title}`}
              onClick={() => openPost(featured.slug)}
              onKeyDown={(e) => cardKey(e, featured.slug)}
            >
              <span className="absolute right-5 top-5 z-10 rounded-full bg-[var(--jr-crimson)] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--jr-ivory)]">
                On the desk tonight
              </span>
              <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                {/* the marquee side — featured photo or the typeset collage */}
                <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-[var(--jr-plum-deep)] p-8 sm:p-10">
                  {featured.featuredImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featured.featuredImage}
                        alt={featured.featuredImageAlt || featured.title}
                        className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                      />
                      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[var(--jr-plum-deep)] via-[var(--jr-plum-deep)]/40 to-transparent" />
                    </>
                  ) : (
                    <>
                      <div aria-hidden="true" className="stage-light absolute -top-16 left-1/4 h-[80%] w-[40%] opacity-30" />
                      <div aria-hidden="true" className="animate-card-drift absolute -right-6 top-8 font-display text-8xl text-[var(--jr-gold)]/10" style={{ "--fr": "8deg" } as React.CSSProperties}>♠</div>
                      <div aria-hidden="true" className="animate-card-drift absolute -bottom-8 left-6 font-display text-9xl text-[var(--jr-gold)]/10" style={{ "--fr": "-10deg", "--delay": "1.4s" } as React.CSSProperties}>♥</div>
                    </>
                  )}
                  <div className="relative">
                    <p className="eyebrow text-[var(--jr-gold-light)]">Featured outline · {featured.category}</p>
                    <h2 className="font-display mt-4 text-3xl font-semibold leading-tight text-[var(--jr-ivory)]">
                      {featured.title}
                    </h2>
                  </div>
                  <div className="relative mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--jr-lavender)]/75">
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> {featured.readingTime} read</span>
                    <span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> {featured.sections.length} chapters inside</span>
                    <span className="inline-flex items-center gap-1.5"><Feather className="h-3.5 w-3.5" aria-hidden="true" /> {featured.date}</span>
                  </div>
                </div>
                {/* the outline side */}
                <div className="flex flex-col p-8 sm:p-10">
                  <p className="text-[15px] leading-7 text-[var(--jr-ink)]">{featured.excerpt}</p>
                  <ul className="mt-6 space-y-3.5 border-t border-[var(--jr-sand)] pt-6">
                    {featured.outline.map((beat, i) => (
                      <li key={beat} className="flex items-start gap-3 text-[14px] leading-6 text-[var(--jr-ink)]">
                        <span className="font-display mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--jr-gold)]/40 bg-[var(--jr-sand-light)]/60 text-[11px] font-semibold text-[var(--jr-gold-dark)]">
                          {i + 1}
                        </span>
                        {beat}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center justify-between gap-4 border-t border-[var(--jr-sand)] pt-6">
                    <p className="text-xs text-[var(--jr-ink)]">
                      By {featured.author || "Jadugar Rajtilak"} · <span className="italic">{featured.keywords}</span>
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--jr-crimson)]">
                      Read the entry <ArrowRight className="h-4 w-4 transition-transform duration-400 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        )}

        {/* ── Category chips ── */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5" role="group" aria-label="Filter journal by category">
          {categories.map((c) => {
            const active = cat === c;
            const n = c === "All" ? posts.length : posts.filter((p) => p.category === c).length;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                aria-pressed={active}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4.5 py-2 text-sm font-medium transition-all duration-400 ${
                  active
                    ? "bg-[var(--jr-plum)] text-[var(--jr-ivory)]"
                    : "border border-[var(--jr-line)] bg-[var(--jr-card)] text-[var(--jr-ink)] hover:border-[var(--jr-gold)] hover:text-[var(--jr-plum)]"
                }`}
              >
                {c}
                <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-[var(--jr-ivory)]/15 text-[var(--jr-cream)]" : "bg-[var(--jr-sand)] text-[#8a8095]"}`}>
                  {n}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── The stack of outlines ── */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 2) * 0.1}>
              <article
                className="card-cine group flex h-full cursor-pointer flex-col rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--jr-gold)]/50"
                tabIndex={0}
                role="button"
                aria-label={`Read the full entry: ${p.title}`}
                onClick={() => openPost(p.slug)}
                onKeyDown={(e) => cardKey(e, p.slug)}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-[var(--jr-gold)]/40 bg-[var(--jr-sand-light)]/60 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--jr-gold)]">
                    {p.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[var(--jr-ink)]">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {p.readingTime}
                  </span>
                </div>
                <h2 className="font-display mt-5 text-2xl font-semibold leading-snug text-[var(--jr-plum)] transition-colors duration-400 group-hover:text-[var(--jr-crimson)]">
                  {p.title}
                </h2>
                {p.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.featuredImage}
                    alt={p.featuredImageAlt || p.title}
                    className="mt-4 h-40 w-full rounded-xl border border-[var(--jr-line)] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : null}
                <p className="mt-3 text-[15px] leading-7 text-[var(--jr-ink)]">{p.excerpt}</p>
                {/* peek inside the outline */}
                <div className="mt-5 rounded-xl bg-[var(--jr-sand-light)]/50 p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--jr-gold-dark)]">
                    <PenLine className="h-3 w-3" aria-hidden="true" /> Inside this outline
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {p.outline.slice(0, 3).map((beat) => (
                      <li key={beat} className="flex items-start gap-2 text-[13px] leading-6 text-[var(--jr-ink)]">
                        <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--jr-gold)]" />
                        {beat}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-[var(--jr-sand)] pt-5" style={{ marginTop: "1.5rem" }}>
                  <span className="text-xs text-[var(--jr-ink)]">
                    {p.date} · {p.readingTime} read
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--jr-crimson)]">
                    Read the entry <ArrowRight className="h-4 w-4 transition-transform duration-400 group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-[var(--jr-ink)]/80">
          Every entry is read in one sitting — tap any card to open it in the Reading Room,
          then share it or ask for a written quote without leaving the page.
          New writing lands through the season, and the Midnight Dispatch hears of it first.
        </p>

        {/* ── From the green room — margin notes ── */}
        <div className="mt-20">
          <SectionHeading
            eyebrow="From the green room"
            title="Notes pinned above the desk"
            sub="Between shows, three sentences stay handwritten on the mirror. They explain the stage better than any résumé could."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {GREEN_ROOM_NOTES.map((n, i) => (
              <Reveal key={n.no} delay={i * 0.12}>
                <figure
                  className="card-cine flex h-full flex-col rounded-lg border border-[var(--jr-gold)]/35 bg-gradient-to-b from-[var(--jr-ivory)] to-[var(--jr-cream)] p-7 shadow-[0_24px_50px_-24px_color-mix(in_srgb,var(--jr-plum)_45%,transparent)]"
                  style={{ transform: `rotate(${n.tilt})` }}
                >
                  <span aria-hidden="true" className="absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-[var(--jr-gold)]/25" />
                  <blockquote className="mt-2 flex-1">
                    <p className="jr-ink-underline font-display text-[19px] font-medium italic leading-8 text-[var(--jr-plum)]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                      “{n.text}”
                    </p>
                  </blockquote>
                  <figcaption className="mt-5 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[var(--jr-gold-dark)]">
                    <span>Green room · {n.no}</span>
                    <Feather className="h-3.5 w-3.5" aria-hidden="true" />
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── The Midnight Dispatch ── */}
        <div className="mt-16">
          <Reveal>
            <MidnightDispatch />
          </Reveal>
        </div>

        {/* closing band */}
        <Reveal className="mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-[var(--jr-plum)] px-6 py-12 text-center">
            <div aria-hidden="true" className="stage-light absolute -top-16 left-1/2 h-[80%] w-[38%] -translate-x-1/2 opacity-30" />
            <div className="relative">
              <p className="eyebrow text-[var(--jr-gold-light)]">Reading is rehearsal</p>
              <p className="font-display mx-auto mt-3 max-w-2xl text-3xl font-medium text-[var(--jr-ivory)]">
                The best evenings are planned by the people who read first.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[var(--jr-lavender)]/80">
                You now know what magic costs, how to book it and where the slot goes. The only chapter
                left unwritten is the one with your date on it.
              </p>
              <button
                onClick={() => {
                  trackEvent("quote_cta_click", { page: "/blog" });
                  navigate("booking");
                }}
                className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3.5 text-[15px] font-semibold text-[var(--jr-ivory)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)]"
              >
                <Wand2 className="h-4 w-4" aria-hidden="true" /> Write the last chapter
              </button>
            </div>
          </div>
        </Reveal>
      </section>
        </>
      )}

      {/* The Reading Room — full article overlay */}
      {reading && (
        <ArticleReader post={reading} onClose={closeReader} navigate={navigate} />
      )}
    </div>
  );
}

// ── FAQ (doc 6: pricing, travel, tech, safety, cancellation) ──

// Myth-or-Marvel flip cards — stage folklore, turned face up.
const MAGIC_MYTHS = [
  {
    myth: "“A magician never reveals the secret.”",
    truth:
      "The profession guards methods, not wonder. On this stage the rule bends kindly — every child at a birthday show leaves with a take-home trick of their own, because the fastest way to love magic is to hold a piece of it.",
  },
  {
    myth: "“It is all camera tricks and editing.”",
    truth:
      "Every frame in the gallery was shot live, inside a real audience, with no retakes — and the close-up act happens in your guests' own hands, where no camera angle can hide. The show is engineered for exactly the room you are seating.",
  },
  {
    myth: "“Magic is only for children.”",
    truth:
      "Tell that to the corporate annual days. The stage act's crowd-work and mentalism segments are built for adult rooms — the laughter is louder, the gasps are lower-pitched, and nobody checks their phone for the entire set.",
  },
];

// The Crystal Ball — playful, clearly-scripted party entertainment. Real
// answers always route to the studio; the ball only ever hedges.
const ORACLE_ANSWERS = [
  "The mists lean toward yes — and toward checking the live calendar before someone else does.",
  "A wise question. The spirits whisper that a written quote would settle it precisely.",
  "The vision is clouded, but a WhatsApp to the studio clears it within hours.",
  "I see an evening… lights down… a room gasping together. The rest depends on your date.",
  "The ball says: most answers on this very page — scroll upward, mortal.",
  "Signs point to a 72-hour soft-hold. Enquire tonight and the answer is reserved.",
  "The crystal is 4.8-star rated, so trust it: this one deserves a call to the studio.",
  "Hmm — the mists insist on a real human for this one. The studio replies within a working day.",
];

const ORACLE_SUGGESTIONS = [
  "Will my date be free?",
  "Do you travel to Jaipur?",
  "Is the show safe for a 6-year-old?",
  "How early should we book?",
];

function CrystalBall() {
  const [question, setQuestion] = useState("");
  const [consulting, setConsulting] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const consult = (q: string) => {
    const query = q.trim();
    if (!query || consulting) return;
    setConsulting(true);
    setAnswer(null);
    window.setTimeout(() => {
      setAnswer(ORACLE_ANSWERS[Math.floor(Math.random() * ORACLE_ANSWERS.length)]);
      setConsulting(false);
    }, 1400);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--jr-gold)]/30 bg-[var(--jr-plum-deep)] p-8 sm:p-10">
      <div aria-hidden="true" className="stage-light absolute -top-24 left-1/2 h-[80%] w-[46%] -translate-x-1/2 opacity-30" />
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="eyebrow text-[var(--jr-gold-light)]">For questions not on the list</p>
        <h3 className="font-display mt-2 text-3xl font-medium text-[var(--jr-ivory)]">Ask the crystal ball</h3>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[var(--jr-lavender)]/85">
          A fortune-teller&apos;s party trick, honestly labelled: the ball hedges in riddles. For real
          answers with real numbers, the studio replies within a working day.
        </p>

        {/* the orb */}
        <div className="relative mx-auto mt-8 h-36 w-36">
          {consulting && (
            <>
              <span aria-hidden="true" className="animate-orb-ring absolute inset-0 rounded-full border-2 border-[var(--jr-gold)]/40" />
              <span aria-hidden="true" className="animate-orb-ring absolute inset-0 rounded-full border border-[var(--jr-gold)]/30" style={{ animationDelay: "0.8s" }} />
            </>
          )}
          <div
            className={`relative h-full w-full overflow-hidden rounded-full border border-[var(--jr-gold)]/45 bg-[radial-gradient(circle_at_38%_28%,color-mix(in_srgb,var(--jr-gold-light)_45%,transparent),color-mix(in_srgb,var(--jr-plum)_85%,black)_62%)] shadow-[0_30px_60px_-25px_color-mix(in_srgb,var(--jr-gold)_65%,transparent)] ${consulting ? "animate-orb-swirl" : ""}`}
            role="img"
            aria-label={consulting ? "The crystal ball swirls, consulting the mists" : "A crystal ball, waiting for your question"}
          >
            <div aria-hidden="true" className="absolute left-[18%] top-[14%] h-8 w-12 -rotate-12 rounded-full bg-[var(--jr-ivory)]/25 blur-[6px]" />
            <span className="absolute inset-0 flex items-center justify-center">
              <Sparkles className={`h-7 w-7 ${consulting ? "animate-pulse text-[var(--jr-gold-light)]" : "text-[var(--jr-gold)]/60"}`} aria-hidden="true" />
            </span>
          </div>
        </div>

        {/* the question form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            consult(question);
          }}
          className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="oracle-question" className="sr-only">Your question for the crystal ball</label>
          <input
            id="oracle-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about booking the magic…"
            className="min-h-11 flex-1 rounded-full border border-[var(--jr-gold)]/30 bg-[var(--jr-plum)]/60 px-6 text-[15px] text-[var(--jr-ivory)] placeholder:text-[var(--jr-lavender)]/50 focus:border-[var(--jr-gold)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={consulting || !question.trim()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--jr-crimson)] px-7 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)] disabled:opacity-50"
          >
            {consulting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
            {consulting ? "Consulting…" : "Consult the ball"}
          </button>
        </form>

        {/* suggested questions */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {ORACLE_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQuestion(s);
                consult(s);
              }}
              className="rounded-full border border-[var(--jr-gold)]/25 px-3.5 py-1.5 text-xs text-[var(--jr-lavender)]/80 transition-colors hover:border-[var(--jr-gold)]/60 hover:text-[var(--jr-ivory)]"
            >
              {s}
            </button>
          ))}
        </div>

        {/* the answer */}
        {answer && (
          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-[var(--jr-gold)]/40 bg-[color-mix(in_srgb,var(--jr-plum)_55%,var(--jr-plum-deep))] p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--jr-gold-light)]">The ball speaks</p>
            <p className="font-display mt-2 text-lg leading-8 text-[var(--jr-ivory)]">“{answer}”</p>
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--jr-gold)]/60 px-6 py-2.5 text-sm font-semibold text-[var(--jr-cream)] transition-colors hover:bg-[var(--jr-gold)]/15"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Get the real answer on WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Tap/hover/keyboard flip card for the myth section.
// Fixed height fits the longest truth at 13px/leading-6 — with CSS
// overflow:hidden on .jr-flip-face as a final guard so text can never
// spill past the card border while it turns.
function MythFlipCard({ myth, truth }: { myth: string; truth: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={`jr-flip jr-flip-hover h-[22rem] cursor-pointer select-none ${flipped ? "is-flipped" : ""}`}
      tabIndex={0}
      role="button"
      aria-pressed={flipped}
      aria-label={`Flip card: ${myth} Hover, tap or press Enter to reveal the truth.`}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
    >
      <div className="jr-flip-inner h-full w-full">
        {/* face — the folklore */}
        <div className="jr-flip-face h-full">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-7">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-[var(--jr-gold)]">The folklore</span>
            <p className="font-display mt-4 flex-1 text-lg font-semibold leading-snug text-[var(--jr-plum)]">{myth}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--jr-crimson)]">
              <Wand2 className="h-3.5 w-3.5" aria-hidden="true" /> Flip for the truth
            </span>
          </div>
        </div>
        {/* back — the truth */}
        <div className="jr-flip-face jr-flip-back h-full">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--jr-gold)]/50 bg-gradient-to-b from-[var(--jr-plum)] to-[var(--jr-plum-deep)] p-7 shadow-[0_25px_50px_-25px_color-mix(in_srgb,var(--jr-plum)_70%,transparent)]">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-[var(--jr-gold-light)]">The truth on this stage</span>
            <p className="mt-4 flex-1 text-[13px] leading-6 text-[var(--jr-lavender)]/90">{truth}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--jr-gold)]">
              <Star className="h-3.5 w-3.5" aria-hidden="true" /> Verified by the shows themselves
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqView({ navigate }: { navigate: (r: RouteId) => void }) {
  const { text } = useSiteCustomization();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");

  const faqs = FAQS.map((f, i) => ({
    q: text(`faq.q${i + 1}`) || f.q,
    a: text(`faq.a${i + 1}`) || f.a,
    cat: f.cat,
  }));

  const searchTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = faqs.filter((f) => {
    const catOk = cat === "all" || f.cat === cat;
    if (!catOk) return false;
    if (searchTerms.length === 0) return true;
    const haystack = `${f.q} ${f.a}`.toLowerCase();
    return searchTerms.every((t) => haystack.includes(t));
  });

  const searching = query.trim().length > 0;

  return (
    <div>
      <PageHero
        eyebrow={text("faq.hero.eyebrow")}
        title={text("faq.hero.title")}
        sub={text("faq.hero.sub")}
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {/* ── The inquiry desk — search + category filters ── */}
        <Reveal>
          <div className="rounded-3xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-6 sm:p-8">
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[var(--jr-gold)]" aria-hidden="true" />
              <label htmlFor="faq-search" className="sr-only">Search the frequently asked questions</label>
              <input
                id="faq-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search nine honest answers — try “travel”, “deposit”, “children”…"
                className="min-h-12 w-full rounded-full border border-[var(--jr-line)] bg-[var(--jr-sand-light)]/50 pl-12 pr-6 text-[15px] text-[var(--jr-plum)] placeholder:text-[var(--jr-ink)]/50 focus:border-[var(--jr-gold)] focus:outline-none"
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filter questions by topic">
              <button
                onClick={() => setCat("all")}
                aria-pressed={cat === "all"}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-400 ${
                  cat === "all"
                    ? "bg-[var(--jr-plum)] text-[var(--jr-ivory)]"
                    : "border border-[var(--jr-line)] bg-[var(--jr-card)] text-[var(--jr-ink)] hover:border-[var(--jr-gold)] hover:text-[var(--jr-plum)]"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> All {faqs.length}
              </button>
              {FAQ_CATS.map((c) => {
                const active = cat === c.id;
                const n = faqs.filter((f) => f.cat === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCat(c.id)}
                    aria-pressed={active}
                    title={c.blurb}
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-400 ${
                      active
                        ? "bg-[var(--jr-plum)] text-[var(--jr-ivory)]"
                        : "border border-[var(--jr-line)] bg-[var(--jr-card)] text-[var(--jr-ink)] hover:border-[var(--jr-gold)] hover:text-[var(--jr-plum)]"
                    }`}
                  >
                    {c.label}
                    <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-[var(--jr-ivory)]/15 text-[var(--jr-cream)]" : "bg-[var(--jr-sand)] text-[#8a8095]"}`}>
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
            {searching && (
              <p className="mt-4 text-center text-xs text-[var(--jr-ink)]" aria-live="polite">
                {visible.length > 0
                  ? `${visible.length} answer${visible.length === 1 ? "" : "s"} found for “${query.trim()}”`
                  : `Nothing matches “${query.trim()}” — the crystal ball below is listening, though.`}
              </p>
            )}
          </div>
        </Reveal>

        {/* ── The answers ── */}
        <Reveal className="mt-8">
          {visible.length > 0 ? (
            <Accordion type="single" collapsible className="rounded-3xl border border-[var(--jr-line)] bg-[var(--jr-card)] px-6 sm:px-8">
              {visible.map((f) => (
                <AccordionItem key={f.q} value={f.q} className="border-[var(--jr-line)]">
                  <AccordionTrigger className="text-left font-display text-lg font-semibold text-[var(--jr-plum)] hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-[15px] leading-8 text-[var(--jr-ink)]">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="rounded-3xl border border-dashed border-[var(--jr-gold)]/40 bg-[var(--jr-sand-light)]/40 px-6 py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-[var(--jr-gold)]/60" aria-hidden="true" />
              <p className="font-display mt-4 text-xl font-semibold text-[var(--jr-plum)]">The desk drawer is empty for that one.</p>
              <p className="mx-auto mt-2 max-w-md text-[15px] leading-7 text-[var(--jr-ink)]">
                Try a different word — or ask the crystal ball below and let it route you to a human
                who actually knows.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setCat("all");
                }}
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--jr-gold)]/60 px-6 py-2.5 text-sm font-semibold text-[var(--jr-plum)] transition-colors hover:bg-[var(--jr-sand-light)]"
              >
                Reset the search
              </button>
            </div>
          )}
        </Reveal>

        {/* ── Myth or Marvel — flip cards ── */}
        <div className="mt-20">
          <SectionHeading
            eyebrow="Myth or Marvel?"
            title="Stage folklore, turned face up"
            sub="Three things people whisper about magicians, flipped over — because the truth on this stage is stranger than the folklore."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {MAGIC_MYTHS.map((m, i) => (
              <Reveal key={m.myth} delay={i * 0.12}>
                <MythFlipCard myth={m.myth} truth={m.truth} />
              </Reveal>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-[var(--jr-ink)]/70">
            Hover — or tap — a card to turn it over. (Keyboard: focus a card and press Enter.)
          </p>
        </div>

        {/* ── The crystal ball ── */}
        <div className="mt-16">
          <Reveal>
            <CrystalBall />
          </Reveal>
        </div>

        <Reveal className="mt-10 text-center">
          <button
            onClick={() => navigate("contact")}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--jr-gold)]/60 px-8 py-3 text-[15px] font-semibold text-[var(--jr-plum)] transition-all duration-500 hover:bg-[var(--jr-sand-light)]"
          >
            {text("faq.cta")}
          </button>
        </Reveal>
      </section>
    </div>
  );
}

// ── Contact (doc 6: form, WhatsApp click-to-chat, hours, map) — clean flat edition ──
// 3D tilt/perspective effects removed per client request (mobile
// performance + personal preference): flat cards, no rotateY form,
// no floating 3D decor. The wax-seal payoff and occasion picker stay.

// Occasion quick-picker — one tap pre-writes the letter's opening so
// hosts never face a blank textarea. The [bracketed] fields tell the
// enquirer exactly which details make a same-day quote possible.
const OCCASIONS = [
  {
    id: "birthday",
    label: "Birthday",
    icon: Cake,
    starter:
      "Namaste! We are planning a birthday party in [city] on [date] for around [number] guests. Could you share availability and a written quote?",
  },
  {
    id: "wedding",
    label: "Wedding",
    icon: Heart,
    starter:
      "Namaste! We are planning a wedding function (mehendi / sangeet / reception) in [city] on [date]. We would love to know how live magic fits the evening — please share availability and a quote.",
  },
  {
    id: "corporate",
    label: "Corporate",
    icon: Briefcase,
    starter:
      "Namaste! We are organising a corporate event (annual day / town hall / dealer meet) in [city] on [date] for around [number] attendees. Please share the corporate act options and a written quote.",
  },
  {
    id: "college",
    label: "College fest",
    icon: GraduationCap,
    starter:
      "Namaste! Our college fest is on [date] at [college / auditorium], expecting around [number] students. We are looking for a headline magic act — could you share the fest repertoire and a quote?",
  },
  {
    id: "private",
    label: "Private evening",
    icon: MoonStar,
    starter:
      "Namaste! We are hosting an intimate private evening in [city] on [date] for around [number] guests and would love a salon-style close-up performance. Please share availability and pricing.",
  },
  {
    id: "other",
    label: "Something else",
    icon: Sparkles,
    starter: "Namaste! I would like to talk about: [tell us the occasion, city, date and guests]",
  },
];

export function ContactView() {
  const { toast } = useToast();
  const { text } = useSiteCustomization();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [occasion, setOccasion] = useState<string | null>(null);

  const pickOccasion = (o: (typeof OCCASIONS)[number]) => {
    setOccasion(o.id);
    setForm((f) => ({ ...f, message: o.starter }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Your name is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (form.message.trim().length < 10) errs.message = "Tell us a little more (10+ characters)";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSending(true);
    // Real submission — stored as a ContactMessage row and visible in
    // Master Admin → Leads → Contact messages.
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setForm({ name: "", email: "", message: "" });
        setOccasion(null);
        setSent(true);
        toast({
          title: "Message received",
          description: "The studio replies within one working day — it is saved in the admin inbox.",
        });
      } else {
        toast({
          title: "Could not send",
          description: json?.error ?? "Please try again, or WhatsApp the studio directly.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Please check your connection or WhatsApp the studio directly.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const CHANNELS = [
    { icon: Phone, label: text("contact.channelCallLabel"), value: SITE.phoneDisplay, note: text("contact.channelCallNote"), href: `tel:${SITE.phoneRaw}`, pip: "K", suit: "♠" },
    { icon: MessageCircle, label: text("contact.channelWhatsAppLabel"), value: "Chat instantly", note: text("contact.channelWhatsAppNote"), href: `https://wa.me/${SITE.whatsapp}`, pip: "A", suit: "♥" },
    { icon: Mail, label: text("contact.channelEmailLabel"), value: SITE.email, note: text("contact.channelEmailNote"), href: `mailto:${SITE.email}`, pip: "Q", suit: "♦" },
    { icon: MapPin, label: text("contact.channelStudioLabel"), value: SITE.address, note: text("contact.channelStudioNote"), href: SITE.mapsUrl, pip: "10", suit: "♣" },
  ];

  return (
    <div>
      <PageHero
        eyebrow={text("contact.hero.eyebrow")}
        title={text("contact.hero.title")}
        sub={text("contact.hero.sub")}
      />

      {/* ── The desk-lamp strip — live status + promises, one glance ── */}
      <section
        aria-label="Studio status and response promises"
        className="border-y border-[var(--jr-gold)]/20 bg-[var(--jr-plum)]"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2.5 px-4 py-4 sm:px-6">
          <span className="inline-flex items-center gap-2.5 text-sm font-medium text-[var(--jr-ivory)]">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--jr-teal)] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--jr-teal)]" />
            </span>
            The desk lamp is lit — replies within one working day
          </span>
          <span className="hidden h-4 w-px bg-[var(--jr-gold)]/25 sm:block" aria-hidden="true" />
          <span className="text-xs text-[var(--jr-lavender)]/85">Same-day quotes on WhatsApp</span>
          <span className="hidden h-4 w-px bg-[var(--jr-gold)]/25 sm:block" aria-hidden="true" />
          <span className="text-xs text-[var(--jr-lavender)]/85">72-hour soft-holds on your date</span>
          <span className="hidden h-4 w-px bg-[var(--jr-gold)]/25 sm:block" aria-hidden="true" />
          <span className="text-xs text-[var(--jr-lavender)]/85">No agents — you write to the magician</span>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* soft stage light behind the section (2D, no 3D) */}
        <div className="stage-light absolute -top-20 left-1/3 h-[60%] w-[34%] opacity-30" aria-hidden="true" />

        {/* channel cards — flat, no tilt */}
        <Reveal>
          <div className="relative space-y-5">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--jr-sand-light)] text-[var(--jr-gold)]">
                <Wand2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="font-display text-2xl font-semibold text-[var(--jr-plum)]">Four ways to reach the magician</p>
            </div>
            {CHANNELS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="card-cine relative flex items-start gap-4 rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-5 transition-colors hover:border-[var(--jr-gold)]/60"
              >
                {/* playing-card corner pips — the studio's calling cards */}
                <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 left-2.5 rotate-180 font-display text-[11px] font-semibold leading-none text-[var(--jr-gold)]/45">
                  {c.pip}
                  <span className="block text-center text-[9px] leading-none">{c.suit}</span>
                </span>
                <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 right-2.5 font-display text-[11px] font-semibold leading-none text-[var(--jr-gold)]/45">
                  {c.pip}
                  <span className="block text-center text-[9px] leading-none">{c.suit}</span>
                </span>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--jr-sand-light)] to-[var(--jr-gold-light)]/70 text-[var(--jr-gold-dark)] shadow-[0_14px_28px_-12px_color-mix(in_srgb,var(--jr-gold)_65%,transparent)]">
                  <c.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--jr-gold)]">{c.label}</p>
                  <p className="mt-0.5 font-medium text-[var(--jr-plum)]">{c.value}</p>
                  <p className="text-sm text-[var(--jr-ink)]">{c.note}</p>
                </div>
                <ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-[var(--jr-gold)]/50" aria-hidden="true" />
              </a>
            ))}
            <p className="rounded-xl bg-[var(--jr-sand-light)]/50 p-4 text-xs leading-6 text-[var(--jr-ink)]">
              Peak-season dates close 6–8 weeks ahead — a quick date check on WhatsApp
              is the fastest way to hold your evening.
            </p>
          </div>
        </Reveal>

        {/* the letter form — flat, no perspective */}
        <Reveal delay={0.12}>
          <div className="relative mt-6 sm:mt-8">
            <form
              onSubmit={submit}
              noValidate
              aria-label="Contact form"
              className="card-cine relative rounded-3xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-7 shadow-[0_35px_80px_-45px_color-mix(in_srgb,var(--jr-plum)_55%,transparent)] sm:p-9"
            >
              <div>
                <h2 className="font-display text-2xl font-semibold text-[var(--jr-plum)]">Write to the studio</h2>
                <p className="mt-1.5 text-sm text-[var(--jr-ink)]">
                  Every message lands directly with Jadugar Rajtilak — no agents, no filters.
                </p>
              </div>

              {sent ? (
                /* ── the sealed-letter state — the form's magic payoff ── */
                <div className="mt-9 flex flex-col items-center rounded-2xl border border-[var(--jr-gold)]/35 bg-[var(--jr-sand-light)]/40 px-6 py-10 text-center">
                  <div className="relative">
                    <Sparkles aria-hidden="true" className="animate-sparkle-twinkle absolute -left-7 -top-4 h-4 w-4 text-[var(--jr-gold)]" />
                    <Sparkles aria-hidden="true" className="animate-sparkle-twinkle-2 absolute -right-8 top-2 h-5 w-5 text-[var(--jr-gold-dark)]" />
                    <Sparkles aria-hidden="true" className="animate-sparkle-twinkle-3 absolute -bottom-3 right-10 h-3.5 w-3.5 text-[var(--jr-gold)]" />
                    {/* the wax seal — JR monogram stamped in crimson */}
                    <div
                      aria-hidden="true"
                      className="animate-seal-stamp animate-seal-glow relative flex h-28 w-28 items-center justify-center"
                      style={{
                        borderRadius: "47% 53% 51% 49% / 52% 48% 56% 44%",
                        background:
                          "radial-gradient(circle at 38% 30%, color-mix(in srgb, var(--jr-crimson) 78%, white), var(--jr-crimson) 55%, color-mix(in srgb, var(--jr-crimson) 72%, black))",
                        boxShadow:
                          "inset 0 4px 10px color-mix(in srgb, white 22%, transparent), inset 0 -6px 12px color-mix(in srgb, black 30%, transparent), 0 16px 32px -12px color-mix(in srgb, var(--jr-crimson) 70%, transparent)",
                      }}
                    >
                      <span
                        className="font-display text-3xl font-semibold tracking-wide text-[var(--jr-ivory)]"
                        style={{ textShadow: "0 2px 4px color-mix(in srgb, black 35%, transparent)" }}
                      >
                        JR
                      </span>
                    </div>
                  </div>
                  <h3 className="font-display mt-7 text-2xl font-semibold text-[var(--jr-plum)]">The letter is sealed</h3>
                  <p className="mx-auto mt-2 max-w-sm text-[15px] leading-7 text-[var(--jr-ink)]">
                    Stamped, saved and sitting on the studio desk. Jadugar replies personally within
                    one working day — usually much sooner on WhatsApp.
                  </p>
                  <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <a
                      href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Namaste! I just sent a letter through the website — checking my date.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-teal)] px-6 py-3 text-sm font-semibold text-[var(--jr-ivory)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--jr-teal)_80%,black)]"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" /> Get a faster reply on WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--jr-gold)]/60 px-6 py-3 text-sm font-semibold text-[var(--jr-plum)] transition-colors hover:bg-[var(--jr-sand-light)]"
                    >
                      <PenLine className="h-4 w-4" aria-hidden="true" /> Write another letter
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── the occasion picker — the letter begins itself ── */}
                  <div className="mt-7">
                    <p className="text-sm font-semibold text-[var(--jr-plum)]">What is the occasion?</p>
                    <p className="mt-0.5 text-xs text-[var(--jr-ink)]">
                      Choose one and the letter begins itself — you only fill in the details.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose the occasion for your enquiry">
                      {OCCASIONS.map((o) => {
                        const active = occasion === o.id;
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => pickOccasion(o)}
                            aria-pressed={active}
                            className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-400 ${
                              active
                                ? "border-[var(--jr-crimson)] bg-[var(--jr-crimson)] text-[var(--jr-ivory)] shadow-[0_10px_24px_-10px_color-mix(in_srgb,var(--jr-crimson)_75%,transparent)]"
                                : "border-[var(--jr-line)] bg-[var(--jr-ivory)]/70 text-[var(--jr-ink)] hover:border-[var(--jr-gold)] hover:text-[var(--jr-plum)]"
                            }`}
                          >
                            <o.icon className="h-3.5 w-3.5" aria-hidden="true" /> {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    <div>
                      <label htmlFor="c-name" className="mb-2 block text-sm font-semibold text-[var(--jr-plum)]">Your name</label>
                      <input
                        id="c-name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="The name the envelope should carry"
                        className="min-h-11 w-full rounded-xl border border-[var(--jr-line)] bg-[var(--jr-ivory)] px-4 text-[15px] outline-none transition-colors focus:border-[var(--jr-gold)] focus:ring-2 focus:ring-[var(--jr-gold)]/25"
                      />
                      {errors.name && <p role="alert" className="mt-1.5 text-sm text-[var(--jr-crimson)]">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="c-email" className="mb-2 block text-sm font-semibold text-[var(--jr-plum)]">Your email</label>
                      <input
                        id="c-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="where the reply flies back"
                        className="min-h-11 w-full rounded-xl border border-[var(--jr-line)] bg-[var(--jr-ivory)] px-4 text-[15px] outline-none transition-colors focus:border-[var(--jr-gold)] focus:ring-2 focus:ring-[var(--jr-gold)]/25"
                      />
                      {errors.email && <p role="alert" className="mt-1.5 text-sm text-[var(--jr-crimson)]">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="c-msg" className="mb-2 block text-sm font-semibold text-[var(--jr-plum)]">The letter</label>
                      <textarea
                        id="c-msg"
                        rows={6}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="City, date, guests — or simply say hello. Every letter reaches the magician himself."
                        className="jr-letter-pad jr-article w-full rounded-xl border border-[var(--jr-line)] bg-[var(--jr-ivory)] px-4 py-3 text-[15px] outline-none transition-colors focus:border-[var(--jr-gold)] focus:ring-2 focus:ring-[var(--jr-gold)]/25"
                      />
                      {errors.message && <p role="alert" className="mt-1.5 text-sm text-[var(--jr-crimson)]">{errors.message}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] shadow-[0_18px_40px_-14px_color-mix(in_srgb,var(--jr-crimson)_80%,transparent)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)] active:translate-y-0.5 disabled:opacity-70"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sealing the envelope…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" aria-hidden="true" /> Seal &amp; send the letter
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] leading-5 text-[var(--jr-ink)]/75">
                      Sealed letters are answered within one working day — and the studio keeps
                      every reply personal.
                    </p>
                  </div>
                </>
              )}
            </form>
          </div>
        </Reveal>
      </section>

      {/* fast-route CTA — 3D pressable */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-[var(--jr-plum)] px-6 py-10 text-center shadow-[0_40px_90px_-40px_color-mix(in_srgb,var(--jr-plum)_80%,transparent)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-60"
              style={{ background: "radial-gradient(80% 90% at 50% 120%, color-mix(in srgb, var(--jr-plum-mid) 80%, var(--jr-crimson)) 0%, transparent 60%)" }}
            />
            <div className="stage-light absolute -top-12 left-[40%] h-[85%] w-[22%] opacity-50" aria-hidden="true" />
            <div
              className="animate-hat-sway absolute left-8 top-6 hidden text-[var(--jr-gold)]/40 md:block"
              aria-hidden="true"
            >
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="relative">
              <p className="eyebrow">The Fastest Route</p>
              <p className="font-display mt-3 text-3xl font-medium text-[var(--jr-ivory)]">
                One WhatsApp message — and the date is on hold
              </p>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[var(--jr-lavender)]/85">
                Skip the forms. Send the occasion, city and date, and receive availability
                plus a written quote on the same day.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Namaste! I would like to check a date for a magic show.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-teal)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] shadow-[0_18px_40px_-14px_color-mix(in_srgb,var(--jr-teal)_85%,transparent)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--jr-teal)_80%,black)] active:translate-y-0.5"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp the Studio
                </a>
                <a
                  href={`tel:${SITE.phoneRaw}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--jr-gold)]/60 px-8 py-3 text-[15px] font-semibold text-[var(--jr-cream)] transition-all duration-500 hover:bg-[var(--jr-gold)]/10 active:translate-y-0.5"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {SITE.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

// ── Legal (doc 6: privacy, terms, cancellation, cookies) ──
const LEGAL_SECTIONS: Record<string, { title: string; blocks: { h: string; p: string }[] }> = {
  privacy: {
    title: "Privacy Policy",
    blocks: [
      {
        h: "Overview",
        p: "This policy explains what personal data Jadugar Rajtilak collects, why, and the rights you hold over it. It is written to align with the Digital Personal Data Protection Act, 2023 (India), in plain language so you always know exactly where you stand.",
      },
      {
        h: "What we collect",
        p: "Enquiry and booking data you submit: name, phone, email, event details (date, city, guests, budget), notes, and attribution data such as the page that referred you. Contact-form messages. Server logs kept for security monitoring.",
      },
      {
        h: "Purpose & consent",
        p: "Data is used only to respond to your enquiry, prepare quotes, manage bookings and improve the site. Submission of the booking form requires an explicit consent checkbox; you may withdraw consent at any time.",
      },
      {
        h: "Retention & deletion",
        p: "Enquiry data is retained as long as commercially reasonable and no longer than needed for the purposes above. Email privacy@jadugarrajtilak.com to request access, correction or erasure of your data; requests are actioned within a reasonable period.",
      },
      {
        h: "Sharing",
        p: "Data is shared only with service providers necessary to operate the booking flow (hosting, email delivery, analytics under consent). No data is sold. Analytics runs under Consent Mode and loads only after consent where required.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    blocks: [
      {
        h: "Scope",
        p: "These terms govern use of this website and the enquiry/booking process for Jadugar Rajtilak live entertainment services. A signed event contract supersedes these terms for the performance itself.",
      },
      {
        h: "Quotes & availability",
        p: "Pricing is shared only as a written quote after an enquiry — scope, fee, travel and technical requirements are all stated in it. Website availability is live but a date is reserved only on advance confirmation; enquiries place a 72-hour soft-hold on the chosen date.",
      },
      {
        h: "Conduct & content",
        p: "Site content, imagery and act descriptions are the property of Jadugar Rajtilak or used under licence. You may not reproduce show material without written permission.",
      },
      {
        h: "Liability",
        p: "Performances are staged with audience safety protocols. Liability is limited to the engagement fee save where exclusion is prohibited by law.",
      },
    ],
  },
  cancellation: {
    title: "Cancellation & Refund Policy",
    blocks: [
      {
        h: "Cancellation by the client",
        p: "Cancellations 30 or more days before the performance: any advance is refunded in full. Within 30 days, the advance is adjustable against a rescheduled date within 12 months. Rescheduling is subject to calendar availability.",
      },
      {
        h: "Cancellation by the studio",
        p: "In the rare event the performance cannot be delivered (except force majeure), any advance is refunded in full within [N] working days, and where possible an alternative date or artist is offered first.",
      },
      {
        h: "Force majeure",
        p: "Events beyond reasonable control (venue closure, regulatory restrictions, natural events) are handled by good-faith rescheduling rather than penalty on either side.",
      },
    ],
  },
  cookies: {
    title: "Cookie Notice",
    blocks: [
      {
        h: "How cookies are used",
        p: "Essential cookies keep the booking flow working (session, availability cache). Analytics and marketing cookies — if enabled — load only after you consent via the banner, in line with Consent Mode v2 expectations.",
      },
      {
        h: "Your choices",
        p: "You can accept or decline non-essential cookies at any time; declining never blocks the enquiry form. The banner renews choices periodically as required.",
      },
    ],
  },
};

export function LegalView() {
  const [tab, setTab] = useState("privacy");
  const doc = LEGAL_SECTIONS[tab];
  return (
    <div>
      <PageHero
        eyebrow="Legal"
        title="The fine print, in plain language"
        sub="Plain-language policies for enquiries and bookings — the same terms your written quote carries."
      />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 gap-1 bg-[var(--jr-sand)] sm:grid-cols-4">
            {Object.entries(LEGAL_SECTIONS).map(([k, v]) => (
              <TabsTrigger key={k} value={k} className="font-medium data-[state=active]:bg-[var(--jr-card)]">
                {v.title.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(LEGAL_SECTIONS).map(([k, v]) => (
            <TabsContent key={k} value={k} className="mt-6">
              <div className="rounded-3xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-7 sm:p-9">
                <h2 className="font-display text-2xl font-semibold text-[var(--jr-plum)]">{v.title}</h2>
                <p className="mt-2 text-xs text-[var(--jr-ink)]">Last updated: October 2026</p>
                <div className="mt-7 space-y-7">
                  {v.blocks.map((b) => (
                    <div key={b.h}>
                      <h3 className="font-display text-lg font-semibold text-[var(--jr-plum)]">{b.h}</h3>
                      <p className="mt-2 text-[15px] leading-8 text-[var(--jr-ink)]">{b.p}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
