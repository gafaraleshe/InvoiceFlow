#!/usr/bin/env python3
"""
Generate PLACEHOLDER brand assets (favicons, PWA icons, OG images) from the
Hermite Labs monogram.

The monogram geometry is taken verbatim from the brand system: an `H` built
from two rails and a severed crossbar, on a 48x48 grid.

    rail L      x=8  y=7  w=6  h=34  r=3
    rail R      x=34 y=7  w=6  h=34  r=3
    crossbar L  x=8  y=21 w=12 h=6   r=3
    crossbar R  x=28 y=21 w=12 h=6   r=3   <- the accent segment, product only

These are PLACEHOLDERS. They use DejaVu Sans (not Inter) and a programmatic
approximation of the mark. See README.md ("Brand assets") for the list of files
to replace with real artwork.

Usage:  python3 scripts/gen-brand-assets.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# ─── Tokens (from the brand system) ──────────────────────────────────────────
INK_050 = "#08090A"
INK_600 = "#6B7378"
INK_800 = "#C9CFD3"
PAPER = "#FAFAFA"
BORDER = (255, 255, 255, 23)  # rgba(255,255,255,.09)

ACCENTS = {
    "labs": None,  # parent brand is monochrome — accent is a product privilege
    "flow": "#3ADCC8",
    "cut": "#FF7A45",
    "mind": "#9B8AFB",
}

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "client" / "public"
FONT_PATH = "DejaVuSans.ttf"
FONT_BOLD = "DejaVuSans-Bold.ttf"

# Monogram rects on the 48-unit grid: (x, y, w, h, radius, is_accent_segment)
MARK = [
    (8, 7, 6, 34, 3, False),
    (34, 7, 6, 34, 3, False),
    (8, 21, 12, 6, 3, False),
    (28, 21, 12, 6, 3, True),
]


def draw_mark(draw, ox, oy, size, fg=PAPER, accent=None):
    """Draw the monogram with its top-left at (ox, oy), scaled to `size`."""
    s = size / 48.0
    for x, y, w, h, r, is_accent in MARK:
        color = accent if (is_accent and accent) else fg
        draw.rounded_rectangle(
            [ox + x * s, oy + y * s, ox + (x + w) * s, oy + (y + h) * s],
            radius=max(1, r * s),
            fill=color,
        )


def icon(size, pad_ratio=0.18, bg=INK_050, accent=None, radius_ratio=0.0):
    """Square app icon: mark centred on an ink field."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if radius_ratio:
        d.rounded_rectangle(
            [0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=bg
        )
    else:
        d.rectangle([0, 0, size, size], fill=bg)
    inner = size * (1 - 2 * pad_ratio)
    draw_mark(d, size * pad_ratio, size * pad_ratio, inner, accent=accent)
    return img


def grid_overlay(img, step, color=BORDER):
    """64px background grid — the brand system's hero treatment."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for x in range(0, img.width, step):
        d.line([(x, 0), (x, img.height)], fill=color, width=1)
    for y in range(0, img.height, step):
        d.line([(0, y), (img.width, y)], fill=color, width=1)
    return Image.alpha_composite(img.convert("RGBA"), overlay)


def og_image(product, wordmark_a, wordmark_b, tagline, label):
    """1200x630 Open Graph card."""
    W, H = 1200, 630
    accent = ACCENTS[product]
    img = Image.new("RGBA", (W, H), INK_050)
    img = grid_overlay(img, 64)
    d = ImageDraw.Draw(img)

    try:
        f_label = ImageFont.truetype(FONT_PATH, 19)
        f_word = ImageFont.truetype(FONT_BOLD, 62)
        f_tag = ImageFont.truetype(FONT_PATH, 27)
    except OSError:  # pragma: no cover - font availability varies
        f_label = f_word = f_tag = ImageFont.load_default()

    x0, y0 = 84, 150
    draw_mark(d, x0, y0, 92, accent=accent)

    # Wordmark: "Hermite" in paper, product half in accent (or ink-600 for parent).
    wx = x0 + 124
    wy = y0 + 8
    d.text((wx, wy), wordmark_a, font=f_word, fill=PAPER)
    aw = d.textlength(wordmark_a, font=f_word)
    d.text((wx + aw, wy), wordmark_b, font=f_word, fill=accent or INK_600)

    # Mono uppercase micro-label, letterspaced by hand (PIL has no tracking).
    lx = x0
    ly = y0 + 168
    for ch in label.upper():
        d.text((lx, ly), ch, font=f_label, fill=INK_600)
        lx += d.textlength(ch, font=f_label) + 3.1

    d.text((x0, y0 + 214), tagline, font=f_tag, fill=INK_800)

    # Full-bleed hairline rule + accent tick, per the section-rule convention.
    d.line([(0, H - 92), (W, H - 92)], fill=BORDER, width=1)
    if accent:
        d.rectangle([x0, H - 93, x0 + 64, H - 91], fill=accent)

    return img.convert("RGB")


def svg_favicon(path, accent=None):
    rects = []
    for x, y, w, h, r, is_accent in MARK:
        fill = accent if (is_accent and accent) else PAPER
        rects.append(
            f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"/>'
        )
    body = "\n".join(rects)
    path.write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" '
        'width="48" height="48" role="img" aria-label="Hermite Labs">\n'
        f'  <rect width="48" height="48" rx="10" fill="{INK_050}"/>\n'
        f"{body}\n"
        "</svg>\n"
    )


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    svg_favicon(OUT / "favicon.svg")
    svg_favicon(OUT / "favicon-flow.svg", accent=ACCENTS["flow"])

    # Browser favicons (multi-size .ico + individual PNGs).
    ico_sizes = [16, 32, 48, 64]
    icon(256, pad_ratio=0.16, radius_ratio=0.18).save(
        OUT / "favicon.ico", sizes=[(s, s) for s in ico_sizes]
    )
    for s in (16, 32):
        icon(s, pad_ratio=0.14).save(OUT / f"favicon-{s}x{s}.png")

    # Apple touch icon — no transparency, no rounding (iOS masks it itself).
    icon(180, pad_ratio=0.19).convert("RGB").save(OUT / "apple-touch-icon.png")

    # PWA icons. The maskable variant needs a wider safe area (~20% inset).
    icon(192, pad_ratio=0.18).save(OUT / "icon-192.png")
    icon(512, pad_ratio=0.18).save(OUT / "icon-512.png")
    icon(512, pad_ratio=0.28).save(OUT / "icon-512-maskable.png")

    # Open Graph / Twitter cards.
    og_image(
        "labs", "Hermite", " Labs", "Software for creative businesses.", "hermitelabs.com"
    ).save(OUT / "og-image.png", quality=92)
    og_image(
        "flow", "Hermite", "Flow", "Invoicing for creatives.", "flow.hermitelabs.com"
    ).save(OUT / "og-image-flow.png", quality=92)

    print(f"Wrote placeholder brand assets to {OUT.relative_to(ROOT)}/")
    for p in sorted(OUT.glob("*")):
        if p.is_file() and p.name != ".gitkeep":
            print(f"  {p.name:<26} {p.stat().st_size:>7,} bytes")


if __name__ == "__main__":
    main()
