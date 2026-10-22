import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--jr-ivory)] px-6 text-center">
      { }
      <span className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--jr-gold)]/70 bg-[#1b2740] shadow-[0_6px_18px_-6px_rgba(27,39,64,0.55)]">
        <img src="/images/logo-emblem-v2.png" alt="Jadugar Rajtilak emblem" className="h-full w-full object-contain" />
      </span>
      <p className="eyebrow mt-8">Nothing up this sleeve</p>
      <h1 className="font-display mt-3 text-4xl font-semibold text-[var(--jr-plum)]">
        This page vanished.
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-7 text-[var(--jr-ink)]">
        The link you followed has disappeared — the good kind of magic, but not the useful kind
        here. The royal stage is one step away.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-[var(--jr-crimson)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] transition-colors hover:bg-[var(--jr-crimson-hover)]"
      >
        Back to the stage
      </Link>
    </div>
  );
}
