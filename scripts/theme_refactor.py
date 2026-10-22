#!/usr/bin/env python3
"""One-shot refactor: convert hardcoded brand hexes to live theme CSS vars.

Contexts handled:
  1. Tailwind solid  —  bg-[#b8923a]        →  bg-[var(--jr-gold)]
  2. Tailwind alpha  —  border-[#b8923a]/40 →  border-[color-mix(in_srgb,var(--jr-gold)_40%,transparent)]
  3. Inline CSS hex  —  #3a2652 0%          →  var(--jr-plum-mid) 0%
  4. rgba()          —  rgba(184,146,58,0.28) → color-mix(...) with
     underscores when inside a Tailwind arbitrary bracket, real spaces
     when in an inline style.

Admin panels and the customization registry are excluded: the admin
console keeps its fixed chrome, and registry default hex values are
data, not CSS.
"""
import re
import sys
from pathlib import Path

ROOT = Path("/home/z/my-project/src")

HEX_MAP = {
    "b8923a": "--jr-gold",
    "e6c477": "--jr-gold-light",
    "d9b666": "--jr-gold-soft",
    "8f6d27": "--jr-gold-dark",
    "b3263e": "--jr-crimson",
    "c2314c": "--jr-crimson-hover",
    "3e8e8a": "--jr-teal",
    "2a1b3d": "--jr-plum",
    "35224d": "--jr-plum-mid",
    "3a2652": "--jr-plum-mid",
    "3a2752": "--jr-plum-mid",
    "150c20": "--jr-plum-deep",
    "1c1129": "--jr-plum-deep",
    "faf6ee": "--jr-ivory",
    "fdf8ee": "--jr-ivory",
    "fffdf7": "--jr-card",
    "f6f0e2": "--jr-sand",
    "efe8da": "--jr-sand",
    "f3ead3": "--jr-sand-light",
    "f3e7c8": "--jr-cream",
    "e8ddc4": "--jr-cream",
    "e7def0": "--jr-lavender",
    "5b5266": "--jr-ink",
    "e3d9c6": "--jr-line",
    "ddd2bc": "--jr-line",
}

RGBA_MAP = {
    (184, 146, 58): "--jr-gold",
    (230, 196, 119): "--jr-gold-light",
    (233, 200, 120): "--jr-gold-light",
    (240, 215, 150): "--jr-gold-light",
    (216, 178, 92): "--jr-gold-soft",
    (217, 182, 102): "--jr-gold-soft",
    (179, 38, 62): "--jr-crimson",
    (194, 49, 76): "--jr-crimson-hover",
    (62, 142, 138): "--jr-teal",
    (42, 27, 61): "--jr-plum",
    (53, 34, 77): "--jr-plum-mid",
    (58, 38, 82): "--jr-plum-mid",
    (21, 12, 32): "--jr-plum-deep",
    (28, 17, 41): "--jr-plum",
    (250, 246, 238): "--jr-ivory",
    (253, 248, 238): "--jr-ivory",
    (255, 253, 247): "--jr-card",
    (246, 240, 226): "--jr-sand",
    (239, 232, 218): "--jr-sand",
    (243, 234, 211): "--jr-sand-light",
    (243, 231, 200): "--jr-cream",
    (231, 223, 240): "--jr-lavender",
    (91, 82, 102): "--jr-ink",
    (227, 217, 198): "--jr-line",
}

TARGETS = [
    ROOT / "components" / "home",
    ROOT / "components" / "views",
    ROOT / "components" / "site",
    ROOT / "components" / "hero",
    ROOT / "components" / "booking",
    ROOT / "app" / "not-found.tsx",
]

RGBA_RE = re.compile(
    r"rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)"
)
HEX_ALPHA_RE = re.compile(r"\[#([0-9a-fA-F]{6})\]/(\d+)\]")
HEX_SOLID_RE = re.compile(r"\[#([0-9a-fA-F]{6})\]")
HEX_BARE_RE = re.compile(r"#([0-9a-fA-F]{6})\b")


def inside_tailwind_bracket(line: str, pos: int) -> bool:
    """True if pos sits inside an unclosed [...] Tailwind arbitrary value."""
    last_open = line.rfind("[", 0, pos)
    last_close = line.rfind("]", 0, pos)
    return last_open > last_close


def convert_line(line: str) -> tuple[str, int]:
    changes = 0

    # 2. Tailwind alpha classes
    def alpha_sub(m: re.Match) -> str:
        nonlocal changes
        var = HEX_MAP.get(m.group(1).lower())
        if not var:
            return m.group(0)
        changes += 1
        return f"[color-mix(in_srgb,var({var})_{m.group(2)}%,transparent)]"

    line = HEX_ALPHA_RE.sub(alpha_sub, line)

    # 1. Tailwind solid classes
    def solid_sub(m: re.Match) -> str:
        nonlocal changes
        var = HEX_MAP.get(m.group(1).lower())
        if not var:
            return m.group(0)
        changes += 1
        return f"[var({var})]"

    line = HEX_SOLID_RE.sub(solid_sub, line)

    # 4. rgba() — pick underscore or space flavour by context
    def rgba_sub(m: re.Match) -> str:
        nonlocal changes
        rgb = (int(m.group(1)), int(m.group(2)), int(m.group(3)))
        var = RGBA_MAP.get(rgb)
        if not var:
            return m.group(0)
        alpha = m.group(4)
        # normalize 0.5 → 50
        pct = int(round(float(alpha) * 100))
        changes += 1
        tail = inside_tailwind_bracket(line, m.start())
        if tail:
            return f"color-mix(in_srgb,var({var})_{pct}%,transparent)"
        return f"color-mix(in srgb, var({var}) {pct}%, transparent)"

    line = RGBA_RE.sub(rgba_sub, line)

    # 3. bare hexes remaining in inline styles / gradients
    def bare_sub(m: re.Match) -> str:
        nonlocal changes
        var = HEX_MAP.get(m.group(1).lower())
        if not var:
            return m.group(0)
        changes += 1
        return f"var({var})"

    line = HEX_BARE_RE.sub(bare_sub, line)

    return line, changes


def main() -> None:
    files: list[Path] = []
    for target in TARGETS:
        if target.is_file():
            files.append(target)
        elif target.is_dir():
            files.extend(sorted(target.glob("*.tsx")))
    total = 0
    for f in files:
        text = f.read_text(encoding="utf-8")
        out_lines = []
        file_changes = 0
        for line in text.splitlines(keepends=True):
            # keep the newline out of the conversion
            stripped = line.rstrip("\n")
            converted, n = convert_line(stripped)
            file_changes += n
            out_lines.append(converted + ("\n" if line.endswith("\n") else ""))
        if file_changes:
            f.write_text("".join(out_lines), encoding="utf-8")
            print(f"{f.relative_to(ROOT)}: {file_changes} replacements")
            total += file_changes
    print(f"TOTAL: {total} replacements across {len(files)} files")


if __name__ == "__main__":
    sys.exit(main())
