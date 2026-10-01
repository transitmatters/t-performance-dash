"""Headline numbers for the social cards, from the same static JSON the landing page reads.

The math mirrors modules/landing/utils.ts so a card never disagrees with the site.
"""

from dataclasses import dataclass
from datetime import date, datetime, timedelta

import requests

SOURCES = {
    "trip_metrics": "static/landing/trip_metrics.json",
    "ridership": "static/landing/ridership.json",
    "baselines": "static/landing/baselines.json",
    "delay_totals": "static/slowzones/delay_totals.json",
}

RAIL_LINES = ["line-red", "line-orange", "line-blue", "line-green", "line-mattapan"]
# delay_totals.json columns
SLOW_ZONE_COLUMNS = {
    "line-red": "Red",
    "line-orange": "Orange",
    "line-blue": "Blue",
    "line-green": "Green",
    "line-mattapan": "Mattapan",
}
# Scheduled service and ridership baselines use GTFS-style ids; see common/utils/baselines.ts.
GTFS_LINE_IDS = {
    "line-red": "line-Red",
    "line-orange": "line-Orange",
    "line-blue": "line-Blue",
    "line-green": "line-Green",
    "line-mattapan": "line-Mattapan",
    "line-RIDE": "line-RIDE",
}
SLOW_ZONE_DAYS = 90
SLOW_ZONE_COMPARISON_DAYS = 30


@dataclass
class Stat:
    value: str
    label: str
    comparison: str | None = None


@dataclass
class CardStats:
    stats: list[Stat]
    as_of: str
    series: list[float] | None = None
    series_label: str | None = None


def fetch_sources(host: str) -> dict:
    """Fetch each source from the frontend host. A source that fails is left out, not fatal."""
    scheme = "http" if host.startswith("localhost") or host.startswith("127.") else "https"
    sources = {}
    for name, path in SOURCES.items():
        try:
            response = requests.get(f"{scheme}://{host}/{path}", timeout=15)
            response.raise_for_status()
            sources[name] = response.json()
        except (requests.RequestException, ValueError) as error:
            print(f"og cards: could not load {path}: {error}")
    return sources


def _baseline(sources: dict, metric: str, series_id: str) -> float | None:
    value = sources.get("baselines", {}).get("metrics", {}).get(metric, {}).get("series", {}).get(series_id, {})
    value = value.get("value") if isinstance(value, dict) else None
    return value if isinstance(value, (int, float)) and value > 0 else None


def _pct_of_max(value: float, baseline: float | None) -> str | None:
    return f"{round(100 * value / baseline)}% of historical maximum" if baseline else None


def _week_of(iso: str) -> str:
    return f"Week of {_pretty_date(iso)}"


def _pretty_date(iso: str) -> str:
    day = date.fromisoformat(iso[:10])
    return f"{day:%b} {day.day}, {day.year}"


def _mph(point: dict) -> float:
    return point["miles_covered"] / (point["total_time"] / 3600)


def _trip_metrics(sources: dict, line: str) -> list[dict]:
    """Weeks with service. A shutdown week has zero miles, so it can't stand in for "this week"."""
    return [p for p in sources.get("trip_metrics", {}).get(line, []) if p.get("miles_covered") and p.get("total_time")]


def _speed(sources: dict, line: str) -> tuple[Stat, list[float], str] | None:
    weeks = _trip_metrics(sources, line)
    if not weeks:
        return None
    latest = weeks[-1]
    stat = Stat(
        f"{_mph(latest):.1f} mph", "average speed", _pct_of_max(_mph(latest), _baseline(sources, "speed", line))
    )
    return stat, [_mph(p) for p in weeks], latest["date"]


def _service(sources: dict, line: str) -> tuple[Stat, list[float], str] | None:
    weeks = _trip_metrics(sources, line)
    if not weeks:
        return None
    latest = weeks[-1]
    baseline = _baseline(sources, "scheduledService", GTFS_LINE_IDS.get(line, line))
    stat = Stat(f"{round(latest['count']):,}", "round trips per day", _pct_of_max(latest["count"], baseline))
    return stat, [p["count"] for p in weeks], latest["date"]


def _ridership(sources: dict, line: str) -> tuple[Stat, list[float], str] | None:
    weeks = [p for p in sources.get("ridership", {}).get(line, []) if p.get("count")]
    if not weeks:
        return None
    latest = weeks[-1]
    baseline = _baseline(sources, "ridership", GTFS_LINE_IDS.get(line, line))
    stat = Stat(f"{latest['count']:,}", "riders per weekday", _pct_of_max(latest["count"], baseline))
    return stat, [p["count"] for p in weeks], latest["date"]


def _duration(seconds: float) -> str:
    seconds = round(seconds)
    minutes, secs = divmod(seconds, 60)
    if not minutes:
        return f"{secs}s"
    return f"{minutes}m {secs}s" if secs else f"{minutes}m"


def _slow_zones(sources: dict, columns: list[str], label: str) -> CardStats | None:
    days = sources.get("delay_totals", {}).get("data", [])[-SLOW_ZONE_DAYS:]
    if not days:
        return None
    series = [sum(day.get(column) or 0 for column in columns) for day in days]
    latest_day = datetime.fromisoformat(days[-1]["date"]).date()
    earlier = [
        total
        for day, total in zip(days, series)
        if datetime.fromisoformat(day["date"]).date() <= latest_day - timedelta(days=SLOW_ZONE_COMPARISON_DAYS)
    ]
    comparison = None
    if earlier:
        delta = series[-1] - earlier[-1]
        comparison = (
            f"{_duration(abs(delta))} {'more' if delta > 0 else 'less'} than {SLOW_ZONE_COMPARISON_DAYS} days ago"
            if round(delta)
            else f"Same as {SLOW_ZONE_COMPARISON_DAYS} days ago"
        )
    stat = Stat(_duration(series[-1]), label, comparison)
    return CardStats([stat], _pretty_date(days[-1]["date"]), series, f"Last {len(days)} days")


def _fleet(sources: dict, line: str) -> CardStats | None:
    weeks = [p for p in sources.get("trip_metrics", {}).get(line, []) if p.get("pct_new_trips") is not None]
    if not weeks:
        return None
    latest = weeks[-1]
    stats = [Stat(f"{round(latest['pct_new_trips'])}%", "of trips on new cars")]
    if latest.get("avg_car_age") is not None:
        stats.append(Stat(f"{latest['avg_car_age']:.0f} yrs", "average car age"))
    return CardStats(stats, _week_of(latest["date"]), [p["pct_new_trips"] for p in weeks])


def _single(result: tuple[Stat, list[float], str] | None) -> CardStats | None:
    if not result:
        return None
    stat, series, as_of = result
    return CardStats([stat], _week_of(as_of), series, f"Last {len(series)} weeks")


def card_stats(card: dict, sources: dict) -> CardStats | None:
    """Stats for one entry of og-cards.json, or None for a card that's branding only."""
    line, page = card.get("lineKey"), card.get("page")
    if page == "system/slowzones":
        return _slow_zones(sources, list(SLOW_ZONE_COLUMNS.values()), "added by slow zones, all lines")
    if page == "ridership" and line:
        return _single(_ridership(sources, line))
    if line not in RAIL_LINES:
        return None
    if page == "":
        parts = [part(sources, line) for part in (_speed, _service, _ridership)]
        parts = [p for p in parts if p]
        if not parts:
            return None
        return CardStats([stat for stat, _, _ in parts], _week_of(max(as_of for _, _, as_of in parts)))
    if page == "speed":
        return _single(_speed(sources, line))
    if page == "service":
        return _single(_service(sources, line))
    if page == "slowzones":
        return _slow_zones(sources, [SLOW_ZONE_COLUMNS[line]], "added by slow zones, end to end")
    if page == "fleet":
        return _fleet(sources, line)
    return None
