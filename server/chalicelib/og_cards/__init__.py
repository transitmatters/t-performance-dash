"""Social-card images for link previews, one per prerendered page (see out/og-cards.json)."""

import json

from .render import render_card
from .stats import card_stats, fetch_sources

PREFIX = "static/og"


def render_all(cards: list[dict], sources: dict) -> dict[str, bytes]:
    """PNG bytes keyed by card slug. A card whose stats fail still gets its branded image."""
    images = {}
    for card in cards:
        try:
            stats = card_stats(card, sources)
        except (KeyError, TypeError, ValueError, ZeroDivisionError) as error:
            print(f"og cards: no stats for {card['slug']}: {error}")
            stats = None
        images[card["slug"]] = render_card(card, stats)
    return images


def publish(host: str, s3_client) -> int:
    """Render every card listed in the bucket's og-cards.json back into it. Returns the card count.

    The manifest comes straight from S3 so a deploy's invocation never sees CloudFront's old copy.
    """
    manifest = s3_client.get_object(Bucket=host, Key="og-cards.json")["Body"].read()
    images = render_all(json.loads(manifest), fetch_sources(host))
    for slug, png in images.items():
        s3_client.put_object(
            Bucket=host,
            Key=f"{PREFIX}/{slug}.png",
            Body=png,
            ContentType="image/png",
            CacheControl="public, max-age=3600",
        )
    return len(images)
