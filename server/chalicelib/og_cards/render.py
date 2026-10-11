"""Draws a 1200x630 social card for one page."""

import io
from functools import cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .stats import CardStats

WIDTH, HEIGHT = 1200, 630
PAD = 64
BACKGROUND = "#ffffff"
TEXT = "#1c1917"
MUTED = "#57534e"
FAINT = "#e7e5e4"
HOST = "dashboard.transitmatters.org"
ASSETS = Path(__file__).parent / "assets"
# Off-line cards (landing, system, open source) run the strip map through all four rapid transit lines.
RAPID_TRANSIT_COLORS = ["#da291c", "#ed8b00", "#00843d", "#003da5"]


@cache
def _font(weight: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(ASSETS / f"Inter-{weight}.ttf"), size)


@cache
def _wordmark(height: int) -> Image.Image:
    logo = Image.open(ASSETS / "wordmark.png").convert("RGBA")
    return logo.resize((round(logo.width * height / logo.height), height), Image.LANCZOS)


def _fit(draw: ImageDraw.ImageDraw, text: str, weight: str, size: int, max_width: int) -> ImageFont.FreeTypeFont:
    """The largest font up to `size` that keeps `text` within `max_width`."""
    while size > 12 and draw.textlength(text, font=_font(weight, size)) > max_width:
        size -= 2
    return _font(weight, size)


def _rgb(color: str) -> tuple[int, int, int]:
    color = color.lstrip("#")
    return tuple(int(color[i : i + 2], 16) for i in (0, 2, 4))


def _sparkline(image: Image.Image, series: list[float], box: tuple[int, int, int, int], color: str):
    left, top, right, bottom = box
    low, high = min(series), max(series)
    span = (high - low) or 1
    # Pad the range so a flat or one-sided series still reads as a line, not an edge.
    low, high = low - span * 0.15, high + span * 0.15
    step = (right - left) / max(len(series) - 1, 1)
    points = [
        (left + i * step, bottom - (value - low) / (high - low) * (bottom - top)) for i, value in enumerate(series)
    ]

    fill = Image.new("RGBA", image.size, (0, 0, 0, 0))
    ImageDraw.Draw(fill).polygon([(left, bottom), *points, (points[-1][0], bottom)], fill=(*_rgb(color), 28))
    image.alpha_composite(fill)

    draw = ImageDraw.Draw(image)
    draw.line([(left, bottom), (right, bottom)], fill=FAINT, width=2)
    if len(points) > 1:
        draw.line(points, fill=color, width=6, joint="curve")
    x, y = points[-1]
    draw.ellipse((x - 10, y - 10, x + 10, y + 10), fill=color, outline=BACKGROUND, width=3)


def _strip_map(draw: ImageDraw.ImageDraw, colors: list[str], y: int):
    """A line with stations, for cards without numbers. Each color gets an equal run of the line."""
    run = (WIDTH - 2 * PAD) / len(colors)
    for i, color in enumerate(colors):
        draw.line([(PAD + i * run, y), (PAD + (i + 1) * run, y)], fill=color, width=14)
    for i in range(7):
        x = PAD + 20 + i * (WIDTH - 2 * PAD - 40) / 6
        color = colors[min(int((x - PAD) / run), len(colors) - 1)]
        draw.ellipse((x - 16, y - 16, x + 16, y + 16), fill=BACKGROUND, outline=color, width=7)


def _stat_columns(draw: ImageDraw.ImageDraw, stats, top: int, left: int, width: int, value_size: int):
    column = width // len(stats)
    for i, stat in enumerate(stats):
        x = left + i * column
        max_width = column - 32
        draw.text((x, top), stat.value, font=_fit(draw, stat.value, "Bold", value_size, max_width), fill=TEXT)
        label_top = top + value_size + 18
        draw.text((x, label_top), stat.label, font=_fit(draw, stat.label, "Regular", 30, max_width), fill=MUTED)
        if stat.comparison:
            font = _fit(draw, stat.comparison, "SemiBold", 26, max_width)
            draw.text((x, label_top + 46), stat.comparison, font=font, fill=TEXT)


def render_card(card: dict, stats: CardStats | None) -> bytes:
    """PNG bytes for an og-cards.json entry, with numbers when `stats` has them."""
    color = card.get("color") or TEXT
    image = Image.new("RGBA", (WIDTH, HEIGHT), BACKGROUND)
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 0, WIDTH, 16), fill=color)
    logo = _wordmark(34)
    image.alpha_composite(logo, (PAD, 60))

    heading, subheading = card["heading"], card.get("subheading")
    heading_size = 84 if stats else 104
    heading_font = _fit(draw, heading, "Bold", heading_size, WIDTH - 2 * PAD)
    draw.text((PAD, 128), heading, font=heading_font, fill=TEXT)
    if subheading:
        sub_top = 128 + heading_font.size + 20
        sub_font = _fit(draw, subheading, "SemiBold", 48 if stats else 58, WIDTH - 2 * PAD)
        draw.text((PAD, sub_top), subheading, font=sub_font, fill=MUTED)

    footer_font = _font("Regular", 28)
    footer_top = HEIGHT - PAD - 28
    draw.text((PAD, footer_top), HOST, font=footer_font, fill=MUTED)

    if not stats:
        _strip_map(draw, [color] if card.get("lineKey") else RAPID_TRANSIT_COLORS, 450)
    else:
        as_of = stats.as_of
        draw.text(
            (WIDTH - PAD - draw.textlength(as_of, font=footer_font), footer_top), as_of, font=footer_font, fill=MUTED
        )
        if stats.series and len(stats.stats) == 1:
            _stat_columns(draw, stats.stats, 318, PAD, 560, 96)
            _sparkline(image, stats.series, (680, 330, WIDTH - PAD, 486), color)
            if stats.series_label:
                draw.text((680, 498), stats.series_label, font=_font("Regular", 24), fill=MUTED)
        else:
            _stat_columns(draw, stats.stats, 330, PAD, WIDTH - 2 * PAD, 72)

    out = io.BytesIO()
    image.convert("RGB").save(out, format="PNG", optimize=True)
    return out.getvalue()
