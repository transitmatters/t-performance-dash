"""Tests for the social-card stats, renderer and publisher."""

import io
import json

from PIL import Image

from chalicelib import og_cards
from chalicelib.og_cards.render import render_card
from chalicelib.og_cards.stats import card_stats


def week(date, miles=100.0, hours=5.0, count=200, **extra):
    return {"date": date, "miles_covered": miles, "total_time": hours * 3600, "count": count, **extra}


SOURCES = {
    "trip_metrics": {
        "line-red": [
            week("2026-09-07", miles=90),
            week("2026-09-14", pct_new_trips=40.4, avg_car_age=22.6),
            # A shutdown week has no miles, so the card falls back to the last week with service.
            week("2026-09-21", miles=0, count=0),
        ],
        "line-green": [week("2026-09-21", count=480)],
    },
    "ridership": {
        "line-red": [{"date": "2026-09-14", "count": 120000}, {"date": "2026-09-21", "count": 130543}],
        "line-bus": [{"date": "2026-09-07", "count": 360165}],
        "line-mattapan": [],
    },
    "baselines": {
        "metrics": {
            "speed": {"series": {"line-red": {"value": 25.0}}},
            "scheduledService": {"series": {"line-Red": {"value": 250}, "line-Green": {"value": None}}},
            "ridership": {"series": {"line-Red": {"value": 200000}, "line-bus": {"value": 400000}}},
        }
    },
    "delay_totals": {
        "data": [
            {"date": "2026-08-01T00:00:00", "Red": 300.0, "Blue": 60.0},
            {"date": "2026-08-30T00:00:00", "Red": 200.0, "Blue": 60.0},
            {"date": "2026-09-29T00:00:00", "Red": 70.0, "Blue": 60.0},
        ]
    },
}


def card(slug, line, page, heading="Red Line", subheading="Speed"):
    return {
        "slug": slug,
        "lineKey": line,
        "page": page,
        "heading": heading,
        "subheading": subheading,
        "color": "#da291c",
    }


class TestCardStats:
    def test_speed_matches_the_landing_formula(self):
        stats = card_stats(card("red/speed", "line-red", "speed"), SOURCES)
        assert stats.stats[0].value == "20.0 mph"
        assert stats.stats[0].comparison == "80% of historical maximum"
        assert stats.as_of == "Week of Sep 14, 2026"
        assert stats.series == [18.0, 20.0]
        assert stats.series_label == "Last 2 weeks"

    def test_service_without_a_published_baseline_has_no_comparison(self):
        stats = card_stats(card("green/service", "line-green", "service"), SOURCES)
        assert stats.stats[0].value == "480"
        assert stats.stats[0].comparison is None

    def test_overview_has_speed_service_and_ridership(self):
        stats = card_stats(card("red", "line-red", ""), SOURCES)
        assert [s.label for s in stats.stats] == ["average speed", "round trips per day", "riders per weekday"]
        assert stats.stats[1].comparison == "80% of historical maximum"
        assert stats.stats[2].value == "130,543"
        assert stats.as_of == "Week of Sep 21, 2026"

    def test_bus_ridership_uses_its_own_baseline(self):
        stats = card_stats(card("bus/ridership", "line-bus", "ridership"), SOURCES)
        assert stats.stats[0].comparison == "90% of historical maximum"

    def test_slow_zones_compare_with_a_month_ago(self):
        stats = card_stats(card("red/slowzones", "line-red", "slowzones"), SOURCES)
        assert stats.stats[0].value == "1m 10s"
        assert stats.stats[0].comparison == "2m 10s less than 30 days ago"
        assert stats.as_of == "Sep 29, 2026"

    def test_system_slow_zones_sum_every_line(self):
        stats = card_stats(card("system/slowzones", None, "system/slowzones"), SOURCES)
        assert stats.stats[0].value == "2m 10s"
        assert stats.series == [360.0, 260.0, 130.0]

    def test_fleet(self):
        stats = card_stats(card("red/fleet", "line-red", "fleet"), SOURCES)
        assert [(s.value, s.label) for s in stats.stats] == [
            ("40%", "of trips on new cars"),
            ("23 yrs", "average car age"),
        ]

    def test_pages_without_numbers(self):
        for line, page in [("line-red", "trips/single"), ("line-bus", ""), ("line-mattapan", "ridership"), (None, "")]:
            assert card_stats(card("x", line, page), SOURCES) is None

    def test_missing_sources(self):
        assert card_stats(card("red/speed", "line-red", "speed"), {}) is None
        assert card_stats(card("red/slowzones", "line-red", "slowzones"), {}) is None


def open_png(png: bytes) -> Image.Image:
    image = Image.open(io.BytesIO(png))
    assert image.format == "PNG"
    assert image.size == (1200, 630)
    assert len(png) < 1024 * 1024
    return image


class TestRender:
    def test_each_layout_renders(self):
        for slug, line, page in [
            ("red/speed", "line-red", "speed"),
            ("red", "line-red", ""),
            ("red/fleet", "line-red", "fleet"),
        ]:
            open_png(render_card(card(slug, line, page), card_stats(card(slug, line, page), SOURCES)))

    def test_branded_card_without_a_line(self):
        open_png(render_card(card("index", None, "", heading="Data Dashboard", subheading=None), None))

    def test_bad_data_still_gets_a_card(self):
        broken = {"trip_metrics": {"line-red": [{"date": "2026-09-21", "miles_covered": 10, "total_time": 5}]}}
        images = og_cards.render_all([card("red/service", "line-red", "service")], broken)
        open_png(images["red/service"])


class FakeS3:
    def __init__(self, manifest):
        self.manifest = manifest
        self.puts = []

    def get_object(self, Bucket, Key):
        assert (Bucket, Key) == ("dashboard.example.org", "og-cards.json")
        return {"Body": io.BytesIO(json.dumps(self.manifest).encode())}

    def put_object(self, **kwargs):
        self.puts.append(kwargs)


def test_publish_writes_one_card_per_manifest_entry(monkeypatch):
    monkeypatch.setattr(og_cards, "fetch_sources", lambda host: SOURCES)
    manifest = [card("red/speed", "line-red", "speed"), card("index", None, "", heading="Data Dashboard")]
    s3 = FakeS3(manifest)

    assert og_cards.publish("dashboard.example.org", s3) == 2
    assert [put["Key"] for put in s3.puts] == ["static/og/red/speed.png", "static/og/index.png"]
    assert all(put["Bucket"] == "dashboard.example.org" for put in s3.puts)
    assert all(put["ContentType"] == "image/png" for put in s3.puts)
