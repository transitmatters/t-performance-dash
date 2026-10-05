"""Render the social cards locally, to preview them without deploying.

    npm run build
    cd server && uv run python -m scripts.render_og_cards

Stats come from the live site's static JSON unless --host points elsewhere.
"""

import argparse
import json
from pathlib import Path

from chalicelib.og_cards import render_all
from chalicelib.og_cards.stats import fetch_sources


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--manifest", default="../out/og-cards.json")
    parser.add_argument("--out", default="../out/static/og")
    parser.add_argument("--host", default="dashboard.transitmatters.org")
    parser.add_argument("--only", nargs="*", help="Slugs to render, e.g. red/slowzones")
    args = parser.parse_args()

    cards = json.loads(Path(args.manifest).read_text())
    if args.only:
        cards = [card for card in cards if card["slug"] in args.only]
    for slug, png in render_all(cards, fetch_sources(args.host)).items():
        path = Path(args.out) / f"{slug}.png"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(png)
        print(f"{path} ({len(png) // 1024} KB)")


if __name__ == "__main__":
    main()
