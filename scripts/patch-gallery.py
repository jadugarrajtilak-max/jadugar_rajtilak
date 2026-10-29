#!/usr/bin/env python3
"""Insert the certificate showcase section + cert lightbox into offer-views.tsx."""

P = "/home/z/my-project/src/components/views/offer-views.tsx"
src = open(P, encoding="utf-8").read()

# ── 1. Insert certificate showcase after the masonry wall ──
marker = "        {/* behind the veil — what a still cannot hold */}"
if marker not in src:
    print("ERROR: veil marker not found"); raise SystemExit(1)

CERT_SECTION = '''        {/* ── Honours & Certifications — the paper wall ── */}
        <div
          id="certificates"
          className="relative mt-20 scroll-mt-24 overflow-hidden rounded-3xl border border-[var(--jr-gold)]/30 bg-[var(--jr-plum)] px-5 py-14 sm:px-10"
        >
          <div aria-hidden="true" className="stage-light absolute -top-16 left-1/2 h-[70%] w-[38%] -translate-x-1/2 opacity-30" />
          <div className="relative">
            <SectionHeading
              eyebrow={text("gallery.certs.eyebrow")}
              title={text("gallery.certs.title")}
              sub={text("gallery.certs.sub")}
            />

            {/* honour chips */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-[var(--jr-gold)]/60 bg-[var(--jr-plum-deep)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--jr-gold-light)] shadow-lg">
                <Medal className="h-3.5 w-3.5" aria-hidden="true" /> 2nd Place · I.B.M. 2021
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-[var(--jr-gold)]/40 bg-[var(--jr-plum-deep)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--jr-lavender)] shadow-lg">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified credential
              </span>
            </div>

            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:gap-12">
              {certs.map((cert, i) => (
                <Reveal key={cert.key} delay={i * 0.12}>
                  <figure
                    className={`group relative mx-auto w-full max-w-sm ${i === 0 ? "sm:-rotate-1" : "sm:rotate-1"}`}
                  >
                    {/* ornate gold frame */}
                    <button
                      onClick={() => setCertView(cert.key)}
                      aria-label={`View certificate full-size: ${cert.caption}`}
                      className="block w-full cursor-zoom-in rounded-xl bg-gradient-to-br from-[var(--jr-gold-light)] via-[var(--jr-gold)] to-[var(--jr-gold-dark)] p-[3px] shadow-[0_40px_80px_-35px_rgba(0,0,0,0.8)] transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
                    >
                      <div className="overflow-hidden rounded-[0.6rem] bg-[var(--jr-ivory)] p-2">
                        <img
                          src={cert.src}
                          alt={cert.alt}
                          loading="lazy"
                          className="aspect-[3/4] w-full rounded-sm object-contain transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      </div>
                    </button>
                    {/* caption plate under the frame */}
                    <figcaption className="mx-auto mt-4 max-w-xs text-center">
                      <p className="flex items-center justify-center gap-2 font-display text-[15px] font-semibold leading-snug text-[var(--jr-ivory)]">
                        <Award className="h-4 w-4 shrink-0 text-[var(--jr-gold)]" aria-hidden="true" />
                        {cert.caption}
                      </p>
                      <p className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-[var(--jr-gold-light)]/80">
                        {text("gallery.certs.note")}
                      </p>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

'''

src = src.replace(marker, CERT_SECTION + marker, 1)

# ── 2. Insert the certificate lightbox before the final closing of GalleryView ──
# Anchor: the end of the existing frame lightbox dialog + closing tags of GalleryView
tail_marker = "      </Dialog>\n    </div>\n  );\n}\n\n// ── Testimonials / reviews"
if tail_marker not in src:
    # try to locate by regex — the closing of the lightbox dialog right before GalleryView end
    print("ERROR: tail marker not found"); raise SystemExit(1)

CERT_LIGHTBOX = '''      </Dialog>

      {/* certificate lightbox — full-size, high-detail view */}
      <Dialog open={certView !== null} onOpenChange={(o) => !o && setCertView(null)}>
        <DialogContent
          className="max-w-3xl overflow-hidden rounded-2xl border-[var(--jr-gold)]/40 bg-[var(--jr-plum-deep)] p-0 sm:rounded-3xl"
          aria-describedby={undefined}
        >
          {currentCert && (
            <figure className="relative">
              <DialogTitle className="sr-only">{currentCert.caption}</DialogTitle>
              <div className="bg-[var(--jr-ivory)]">
                <img
                  src={currentCert.src}
                  alt={currentCert.alt}
                  className="max-h-[74vh] w-full object-contain"
                />
              </div>
              {certs.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCertView((cur) => {
                        const idx = certs.findIndex((c) => c.key === cur);
                        return certs[(idx - 1 + certs.length) % certs.length].key;
                      })
                    }
                    aria-label="Previous certificate"
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--jr-gold)]/50 bg-[var(--jr-plum-deep)]/70 text-[var(--jr-cream)] backdrop-blur transition-colors hover:bg-[var(--jr-gold)]/40"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() =>
                      setCertView((cur) => {
                        const idx = certs.findIndex((c) => c.key === cur);
                        return certs[(idx + 1) % certs.length].key;
                      })
                    }
                    aria-label="Next certificate"
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--jr-gold)]/50 bg-[var(--jr-plum-deep)]/70 text-[var(--jr-cream)] backdrop-blur transition-colors hover:bg-[var(--jr-gold)]/40"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </>
              )}
              <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--jr-gold)]/25 px-6 py-4">
                <span className="flex items-center gap-2.5 text-sm text-[var(--jr-lavender)]/85">
                  <Award className="h-3.5 w-3.5 text-[var(--jr-gold)]" aria-hidden="true" />
                  {currentCert.caption}
                </span>
                <span className="text-[11px] tabular-nums uppercase tracking-[0.18em] text-[var(--jr-gold)]">
                  International Brotherhood of Magicians
                </span>
              </figcaption>
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Testimonials / reviews'''

src = src.replace(tail_marker, CERT_LIGHTBOX, 1)

open(P, "w", encoding="utf-8").write(src)
print("offer-views.tsx patched OK")
print("cert section:", "id=\"certificates\"" in src, "| cert lightbox:", "certView !== null" in src)
