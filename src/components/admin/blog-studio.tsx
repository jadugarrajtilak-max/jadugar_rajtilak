"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowDown, ArrowUp, CheckCircle2, Clock, Eye, Feather, FileText,
  ImagePlus, Info, Link2, Loader2, PenLine, Plus, Save, Search, Star,
  Trash2, Upload, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { adminFetch, getAdminKey } from "@/lib/admin-client";
import { evaluateSeo, serpPreview } from "@/lib/seo";

// ─────────────────────────────────────────────────────────────
// Blog Studio — the Master Admin's article CMS.
// Create / edit / delete Journal posts with full on-page SEO control:
// H1 + featured-image alt, meta title & description, keywords,
// inline hyperlinks ([text](url)) in every paragraph, a crawlable
// backlinks list, draft/publish states and a live SEO guidance score.
// ─────────────────────────────────────────────────────────────

type Backlink = { text: string; url: string };
type Section = { h: string; paras: string[] };

export type BlogPostAdmin = {
  id: string;
  slug: string;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  excerpt: string | null;
  category: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  intro: string | null;
  sections: Section[];
  closing: string | null;
  backlinks: Backlink[];
  readingTime: string | null;
  status: string;
  featured: boolean;
  author: string;
  publishedAt: string;
  updatedAt: string;
};

type Draft = {
  id: string | null;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  excerpt: string;
  category: string;
  featuredImage: string;
  featuredImageAlt: string;
  intro: string;
  sections: Section[];
  closing: string;
  backlinks: Backlink[];
  status: "draft" | "published";
  featured: boolean;
};

const CATEGORIES = ["Weddings", "Corporate", "Birthdays", "College Fests", "Guides", "Behind the Curtain"];

const emptyDraft = (): Draft => ({
  id: null,
  slug: "",
  title: "",
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  excerpt: "",
  category: "Guides",
  featuredImage: "",
  featuredImageAlt: "",
  intro: "",
  sections: [{ h: "", paras: [""] }],
  closing: "",
  backlinks: [],
  status: "draft",
  featured: false,
});

const toDraft = (p: BlogPostAdmin): Draft => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  metaTitle: p.metaTitle ?? "",
  metaDescription: p.metaDescription ?? "",
  keywords: p.keywords ?? "",
  excerpt: p.excerpt ?? "",
  category: p.category,
  featuredImage: p.featuredImage ?? "",
  featuredImageAlt: p.featuredImageAlt ?? "",
  intro: p.intro ?? "",
  sections: p.sections.length ? p.sections : [{ h: "", paras: [""] }],
  closing: p.closing ?? "",
  backlinks: p.backlinks ?? [],
  status: p.status === "draft" ? "draft" : "published",
  featured: p.featured,
});

// ── list view ──

function PostList({
  posts, loading, onNew, onEdit, onDelete, deleting,
}: {
  posts: BlogPostAdmin[];
  loading: boolean;
  onNew: () => void;
  onEdit: (p: BlogPostAdmin) => void;
  onDelete: (id: string, title: string) => void;
  deleting: string | null;
}) {
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#2a1b3d]">Blog Studio</h1>
          <p className="mt-1 text-sm text-[#5b5266]">
            Every Journal entry, editable — titles, meta tags, images, links and backlinks.
            Published posts go live instantly.
          </p>
        </div>
        <Button onClick={onNew} className="gap-2 rounded-full bg-[#2a1b3d] text-white hover:bg-[#3d2a52]">
          <Plus className="h-4 w-4" /> New post
        </Button>
      </header>

      <div className="overflow-hidden rounded-3xl border border-[#e3d9c6] bg-[#fffdf7]">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[#5b5266]">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading posts…
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-[#5b5266]">
            <Feather className="mx-auto h-8 w-8 text-[#b8923a]/60" />
            <p className="mt-3 font-medium">No posts yet. Write the first entry.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#eee5d2]">
            {posts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-7">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {p.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf1d7] px-2.5 py-0.5 text-[11px] font-semibold text-[#8a6d1f]">
                        <Star className="h-3 w-3" /> Featured
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        p.status === "published"
                          ? "bg-[#e3f2ea] text-[#2f6d4f]"
                          : "bg-[#fdeaea] text-[#a13d3d]"
                      }`}
                    >
                      {p.status === "published" ? "Published" : "Draft"}
                    </span>
                    <span className="rounded-full bg-[#f0ebdd] px-2.5 py-0.5 text-[11px] font-medium text-[#5b5266]">
                      {p.category}
                    </span>
                  </div>
                  <button
                    onClick={() => onEdit(p)}
                    className="mt-1.5 block max-w-full truncate text-left font-display text-lg font-semibold text-[#2a1b3d] hover:text-[#a13d3d]"
                    title={`Edit: ${p.title}`}
                  >
                    {p.title}
                  </button>
                  <p className="mt-0.5 truncate text-xs text-[#8a8095]">
                    jadugarrajtilak.com/blog/{p.slug} · updated {p.updatedAt} · {p.readingTime}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {p.status === "published" && (
                    <a
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd2bc] text-[#5b5266] transition-colors hover:border-[#b8923a] hover:text-[#8a6d1f]"
                      title="View live post"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(p)}
                    className="gap-1.5 rounded-full border-[#ddd2bc]"
                  >
                    <PenLine className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <button
                    onClick={() => onDelete(p.id, p.title)}
                    disabled={deleting === p.id}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e8c9c9] text-[#a13d3d] transition-colors hover:bg-[#fdeaea] disabled:opacity-50"
                    title="Delete post"
                  >
                    {deleting === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── editor view ──

const linkSyntaxHint = (
  <p className="mt-1.5 text-[11px] leading-5 text-[#8a8095]">
    Hyperlinks: write <code className="rounded bg-[#f0ebdd] px-1 py-0.5 text-[#7a6a3a]">[link text](https://example.com)</code> anywhere inside a paragraph —
    it renders as a real, crawlable hyperlink on the live article.
  </p>
);

function SectionEditor({
  index, section, onChange, onRemove, onMove, canMoveUp, canMoveDown, total,
}: {
  index: number;
  section: Section;
  onChange: (s: Section) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  total: number;
}) {
  return (
    <div className="rounded-2xl border border-[#e3d9c6] bg-[#fffdf7] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-sm font-semibold text-[#2a1b3d]">
          Chapter {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove(-1)} disabled={!canMoveUp}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd2bc] text-[#5b5266] disabled:opacity-30"
            title="Move up"
          ><ArrowUp className="h-3.5 w-3.5" /></button>
          <button
            onClick={() => onMove(1)} disabled={!canMoveDown}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd2bc] text-[#5b5266] disabled:opacity-30"
            title="Move down"
          ><ArrowDown className="h-3.5 w-3.5" /></button>
          <button
            onClick={onRemove}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e8c9c9] text-[#a13d3d]"
            title="Remove chapter"
          ><X className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="mt-3">
        <Label className="text-sm font-semibold text-[#2a1b3d]">H2 heading</Label>
        <Input
          value={section.h}
          onChange={(e) => onChange({ ...section, h: e.target.value })}
          placeholder="e.g. Mapping the wedding timeline"
          className="mt-1.5 border-[#ddd2bc] bg-[#faf6ee]"
        />
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-[#2a1b3d]">Paragraphs</Label>
          <button
            onClick={() => onChange({ ...section, paras: [...section.paras, ""] })}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#8a6d1f] hover:underline"
          ><Plus className="h-3 w-3" /> Add paragraph</button>
        </div>
        {section.paras.map((para, pi) => (
          <div key={pi} className="mt-2">
            <Textarea
              value={para}
              onChange={(e) => {
                const paras = [...section.paras];
                paras[pi] = e.target.value;
                onChange({ ...section, paras });
              }}
              placeholder={`Paragraph ${pi + 1} — plain text, or drop in [link text](https://…) hyperlinks.`}
              rows={4}
              className="border-[#ddd2bc] bg-[#faf6ee] text-[14px] leading-7"
            />
            {section.paras.length > 1 && (
              <button
                onClick={() => onChange({ ...section, paras: section.paras.filter((_, j) => j !== pi) })}
                className="mt-1 text-[11px] font-semibold text-[#a13d3d] hover:underline"
              >Remove this paragraph</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SeoGuidance({ draft }: { draft: Draft }) {
  const body = useMemo(
    () =>
      [draft.intro, ...draft.sections.flatMap((s) => s.paras), draft.closing].join("\n\n"),
    [draft]
  );
  const links = useMemo(() => {
    const matches = body.match(/\[[^\]]+\]\(([^)]+)\)/g) ?? [];
    const urls = matches.map((m) => m.replace(/^[^(]*\(/, "").replace(/\)$/, ""));
    const internal = urls.filter((u) => u.includes("jadugarrajtilak.com") || u.startsWith("/")).length;
    const external = urls.filter((u) => !u.includes("jadugarrajtilak.com") && !u.startsWith("/")).length
      + draft.backlinks.length;
    return { internal, external };
  }, [body, draft.backlinks.length]);

  const { score, checks } = useMemo(
    () =>
      evaluateSeo({
        focusKeyword: draft.keywords.split(",")[0] ?? "",
        title: draft.metaTitle || draft.title,
        slug: draft.slug,
        metaDescription: draft.metaDescription || draft.excerpt,
        body,
        internalLinks: links.internal,
        externalLinks: links.external,
        hasFeaturedImage: draft.featuredImage.trim().length > 0,
        imageAltText: draft.featuredImageAlt.trim().length > 0,
        h2Count: draft.sections.filter((s) => s.h.trim()).length,
      }),
    [draft, links, body]
  );
  const serp = serpPreview(draft.metaTitle || draft.title, `blog/${draft.slug}`, draft.metaDescription || draft.excerpt);
  const scoreColor = score >= 80 ? "#3e8e8a" : score >= 55 ? "#b8923a" : "#b3263e";

  return (
    <div className="space-y-4 rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-[#2a1b3d]">SEO guidance</h3>
        <span
          className="rounded-full px-3 py-1 font-display text-sm font-bold text-white"
          style={{ backgroundColor: scoreColor }}
        >
          {score}/100
        </span>
      </div>
      <p className="flex items-start gap-1.5 text-[11px] leading-5 text-[#8a8095]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b8923a]" />
        Internal guidance modelled on helpful-content principles — not a Google score.
      </p>

      {/* SERP preview */}
      <div className="rounded-2xl border border-[#e3d9c6] bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8a8095]">Google preview</p>
        <p className="mt-2 truncate text-[13px] text-[#5f6368]">jadugarrajtilak.com › {serp.url.split("› ")[1] || "blog"}</p>
        <p className="mt-0.5 truncate text-[17px] text-[#1a0dab]">{serp.truncatedTitle || "Post title"}</p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#4d5156]">
          {serp.truncatedMeta || "Meta description appears here — write one for every post."}
        </p>
      </div>

      <ul className="space-y-1.5">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-[12px] leading-5">
            {c.status === "pass" ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3e8e8a]" />
            ) : c.status === "warn" ? (
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b8923a]" />
            ) : (
              <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b3263e]" />
            )}
            <span className="text-[#3d3548]"><strong>{c.rule}:</strong> {c.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BlogStudio() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPostAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch<{ posts: BlogPostAdmin[] }>("/api/admin/blog");
    if (res.ok && res.data) setPosts(res.data.posts);
    else toast({ title: "Could not load posts", description: res.error, variant: "destructive" });
    setLoading(false);
  }, [toast]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const patch = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));

  const onPickTitle = (title: string) => {
    patch({
      title,
      slug: draft?.id ? draft.slug : slugifyLocal(title),
    });
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-key": getAdminKey() ?? "" },
        body: form,
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        patch({ featuredImage: json.url as string });
        toast({ title: "Image uploaded", description: "Add the SEO alt text below to finish." });
      } else {
        toast({ title: "Upload failed", description: json?.error ?? `HTTP ${res.status}`, variant: "destructive" });
      }
    } catch {
      toast({ title: "Upload failed", description: "Network error — try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!draft) return;
    if (draft.title.trim().length < 4) {
      toast({ title: "Title too short", description: "Give the entry a real headline (4+ characters).", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      ...draft,
      sections: draft.sections.filter((s) => s.h.trim() || s.paras.some((p) => p.trim())),
      backlinks: draft.backlinks.filter((b) => b.text.trim() && b.url.trim()),
    };
    const res = draft.id
      ? await adminFetch(`/api/admin/blog/${draft.id}`, { method: "PUT", body: JSON.stringify(payload) })
      : await adminFetch("/api/admin/blog", { method: "POST", body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) {
      toast({
        title: draft.status === "published" ? "Post is live" : "Draft saved",
        description: draft.status === "published"
          ? `jadugarrajtilak.com/blog/${payload.slug || "slug"} is published and in the sitemap.`
          : "Publish it any time from this editor.",
      });
      setDraft(null);
      loadPosts();
    } else {
      toast({ title: "Could not save", description: res.error, variant: "destructive" });
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This removes it from the live site and sitemap.`)) return;
    setDeleting(id);
    const res = await adminFetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      toast({ title: "Post deleted" });
      loadPosts();
    } else {
      toast({ title: "Could not delete", description: res.error, variant: "destructive" });
    }
  };

  if (!draft) {
    return (
      <PostList
        posts={posts}
        loading={loading}
        onNew={() => setDraft(emptyDraft())}
        onEdit={(p) => setDraft(toDraft(p))}
        onDelete={remove}
        deleting={deleting}
      />
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setDraft(null)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5b5266] hover:text-[#2a1b3d]"
        ><ArrowLeft className="h-4 w-4" /> All posts</button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => patch({ status: draft.status === "published" ? "draft" : "published" })}
            className="gap-1.5 rounded-full border-[#ddd2bc]"
          >
            {draft.status === "published" ? "Unpublish to draft" : "Keep as draft"}
          </Button>
          <Button onClick={save} disabled={saving} className="gap-2 rounded-full bg-[#2a1b3d] text-white hover:bg-[#3d2a52]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {draft.id ? "Save changes" : draft.status === "published" ? "Publish now" : "Save draft"}
          </Button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* ── left: the article editor ── */}
        <div className="space-y-5">
          <div className="space-y-4 rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#f0ebdd] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5b5266]">
                {draft.id ? "Editing" : "New entry"}
              </span>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${draft.status === "published" ? "bg-[#e3f2ea] text-[#2f6d4f]" : "bg-[#fdeaea] text-[#a13d3d]"}`}>
                {draft.status === "published" ? "Published" : "Draft"}
              </span>
              <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm text-[#5b5266]">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) => patch({ featured: e.target.checked })}
                  className="h-4 w-4 accent-[#b8923a]"
                />
                <Star className="h-3.5 w-3.5 text-[#b8923a]" /> Featured on the Journal index
              </label>
            </div>

            <div>
              <Label className="text-sm font-semibold text-[#2a1b3d]">
                H1 title <span className="font-normal text-[#5b5266]">— the article headline</span>
              </Label>
              <Input
                value={draft.title}
                onChange={(e) => onPickTitle(e.target.value)}
                placeholder="e.g. 9 Ways a Magician Elevates a Wedding Evening"
                className="mt-1.5 border-[#ddd2bc] bg-[#faf6ee] font-display text-lg"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-semibold text-[#2a1b3d]">URL slug</Label>
                <Input
                  value={draft.slug}
                  onChange={(e) => patch({ slug: slugifyLocal(e.target.value) })}
                  placeholder="auto-generated-from-title"
                  className="mt-1.5 border-[#ddd2bc] bg-[#faf6ee] text-[13px]"
                />
                <p className="mt-1 text-[11px] text-[#8a8095]">jadugarrajtilak.com/blog/{draft.slug || "…"}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#2a1b3d]">Category</Label>
                <select
                  value={draft.category}
                  onChange={(e) => patch({ category: e.target.value })}
                  className="mt-1.5 h-10 w-full rounded-md border border-[#ddd2bc] bg-[#faf6ee] px-3 text-sm text-[#2a1b3d] focus:border-[#b8923a] focus:outline-none"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="__custom">+ Custom…</option>
                </select>
                {draft.category === "__custom" && null}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-[#2a1b3d]">
                Excerpt <span className="font-normal text-[#5b5266]">— card summary on the Journal index</span>
              </Label>
              <Textarea
                value={draft.excerpt}
                onChange={(e) => patch({ excerpt: e.target.value })}
                rows={2}
                placeholder="One or two sentences that make a scrolling stranger stop and click."
                className="mt-1.5 border-[#ddd2bc] bg-[#faf6ee]"
              />
            </div>
          </div>

          {/* featured image + alt */}
          <div className="space-y-4 rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-7">
            <h3 className="font-display text-lg font-semibold text-[#2a1b3d]">Featured image (H1 image) + SEO alt text</h3>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f);
                  e.target.value = "";
                }}
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="gap-2 rounded-full border-[#ddd2bc]"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading…" : "Upload image"}
              </Button>
              {draft.featuredImage ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#e3f2ea] px-3 py-1.5 text-xs font-semibold text-[#2f6d4f]">
                  <ImagePlus className="h-3.5 w-3.5" /> Uploaded
                </span>
              ) : (
                <span className="text-xs text-[#8a8095]">JPG/PNG/WebP · up to 4 MB</span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-semibold text-[#2a1b3d]">Image URL</Label>
                <Input
                  value={draft.featuredImage}
                  onChange={(e) => patch({ featuredImage: e.target.value })}
                  placeholder="/images/… or https://…"
                  className="mt-1.5 border-[#ddd2bc] bg-[#faf6ee] text-[13px]"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#2a1b3d]">
                  Alt text <span className="font-normal text-[#5b5266]">— describes the image for Google & screen readers</span>
                </Label>
                <Input
                  value={draft.featuredImageAlt}
                  onChange={(e) => patch({ featuredImageAlt: e.target.value })}
                  placeholder="Jadugar Rajtilak performing the ring flight illusion at a Jaipur wedding"
                  className="mt-1.5 border-[#ddd2bc] bg-[#faf6ee] text-[13px]"
                />
              </div>
            </div>
            {draft.featuredImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.featuredImage}
                alt={draft.featuredImageAlt || "Featured image preview"}
                className="max-h-56 w-full rounded-2xl border border-[#e3d9c6] object-cover"
              />
            )}
          </div>

          {/* intro */}
          <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-7">
            <Label className="text-sm font-semibold text-[#2a1b3d]">Intro paragraph</Label>
            <Textarea
              value={draft.intro}
              onChange={(e) => patch({ intro: e.target.value })}
              rows={4}
              placeholder="The opening paragraph — typeset with a drop cap on the live article. Include the focus keyword naturally here."
              className="mt-1.5 border-[#ddd2bc] bg-[#faf6ee] leading-7"
            />
          </div>

          {/* sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-display text-lg font-semibold text-[#2a1b3d]">Chapters (H2 sections)</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => patch({ sections: [...draft.sections, { h: "", paras: [""] }] })}
                className="gap-1.5 rounded-full border-[#ddd2bc]"
              ><Plus className="h-3.5 w-3.5" /> Add chapter</Button>
            </div>
            {linkSyntaxHint}
            {draft.sections.map((s, i) => (
              <SectionEditor
                key={i}
                index={i}
                section={s}
                total={draft.sections.length}
                canMoveUp={i > 0}
                canMoveDown={i < draft.sections.length - 1}
                onChange={(ns) => patch({ sections: draft.sections.map((x, j) => (j === i ? ns : x)) })}
                onRemove={() => patch({ sections: draft.sections.filter((_, j) => j !== i) })}
                onMove={(dir) => {
                  const next = [...draft.sections];
                  const j = i + dir;
                  [next[i], next[j]] = [next[j], next[i]];
                  patch({ sections: next });
                }}
              />
            ))}
          </div>

          {/* closing */}
          <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-7">
            <Label className="text-sm font-semibold text-[#2a1b3d]">Closing note</Label>
            <Textarea
              value={draft.closing}
              onChange={(e) => patch({ closing: e.target.value })}
              rows={3}
              placeholder="The before-you-go note under the last chapter — end with the quote CTA."
              className="mt-1.5 border-[#ddd2bc] bg-[#faf6ee] leading-7"
            />
          </div>

          {/* backlinks */}
          <div className="space-y-3 rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-7">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-[#2a1b3d]">
              <Link2 className="h-4 w-4 text-[#b8923a]" /> Backlinks / references
            </h3>
            <p className="text-[12px] leading-5 text-[#5b5266]">
              Rendered at the end of the live article as a crawlable “References &amp; further reading” list.
              Google-safe: links stay visible to readers (hidden display:none links violate guidelines and get penalised).
            </p>
            {draft.backlinks.map((b, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
                <Input
                  value={b.text}
                  onChange={(e) => patch({ backlinks: draft.backlinks.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })}
                  placeholder="Anchor text"
                  className="border-[#ddd2bc] bg-[#faf6ee] text-[13px]"
                />
                <Input
                  value={b.url}
                  onChange={(e) => patch({ backlinks: draft.backlinks.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })}
                  placeholder="https://partner-site.com/page"
                  className="border-[#ddd2bc] bg-[#faf6ee] text-[13px]"
                />
                <button
                  onClick={() => patch({ backlinks: draft.backlinks.filter((_, j) => j !== i) })}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e8c9c9] text-[#a13d3d]"
                  title="Remove link"
                ><X className="h-4 w-4" /></button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => patch({ backlinks: [...draft.backlinks, { text: "", url: "" }] })}
              className="gap-1.5 rounded-full border-[#ddd2bc]"
            ><Plus className="h-3.5 w-3.5" /> Add backlink</Button>
          </div>
        </div>

        {/* ── right: SEO column ── */}
        <div className="space-y-5">
          <div className="space-y-4 rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-7">
            <h3 className="font-display text-lg font-semibold text-[#2a1b3d]">Meta tags</h3>
            <div>
              <Label className="text-sm font-semibold text-[#2a1b3d]">
                SEO title <span className="font-normal text-[#5b5266]">{(draft.metaTitle || draft.title).length} chars · aim 50–60</span>
              </Label>
              <Input
                value={draft.metaTitle}
                onChange={(e) => patch({ metaTitle: e.target.value })}
                placeholder="Falls back to the H1 if left blank"
                className="mt-1.5 border-[#ddd2bc] bg-[#faf6ee] text-[13px]"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-[#2a1b3d]">
                Meta description <span className="font-normal text-[#5b5266]">{(draft.metaDescription || draft.excerpt).length} chars · aim 140–160</span>
              </Label>
              <Textarea
                value={draft.metaDescription}
                onChange={(e) => patch({ metaDescription: e.target.value })}
                rows={3}
                placeholder="The Google snippet text. Falls back to the excerpt if blank."
                className="mt-1.5 border-[#ddd2bc] bg-[#faf6ee] text-[13px] leading-6"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-[#2a1b3d]">
                Focus keywords <span className="font-normal text-[#5b5266]">— comma separated</span>
              </Label>
              <Input
                value={draft.keywords}
                onChange={(e) => patch({ keywords: e.target.value })}
                placeholder="wedding magician, sangeet entertainment"
                className="mt-1.5 border-[#ddd2bc] bg-[#faf6ee] text-[13px]"
              />
            </div>
          </div>
          <SeoGuidance draft={draft} />
          <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-[#2a1b3d]">
              <Search className="h-4 w-4 text-[#b8923a]" /> Auto SEO on publish
            </h3>
            <ul className="mt-3 space-y-2 text-[12px] leading-5 text-[#5b5266]">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3e8e8a]" /> Table of contents with anchor links generated from your H2s</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3e8e8a]" /> Article schema (JSON-LD), Open Graph &amp; Twitter cards per post</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3e8e8a]" /> Canonical URL + real /blog/slug address</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3e8e8a]" /> Post added to /sitemap.xml automatically</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3e8e8a]" /> Share buttons (WhatsApp / Facebook / X / LinkedIn / copy link)</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3e8e8a]" /> Get-a-quote CTA + reading progress bar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function slugifyLocal(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

