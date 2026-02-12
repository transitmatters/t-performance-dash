"""Utility functions for data grouping, date handling, and S3 data retrieval dispatch."""
import datetime
import pytz
import traceback
from datetime import date, timedelta
from typing import Dict, Any, Callable, List, Union
from chalicelib import s3_historical, s3_alerts, s3

DATE_FORMAT = "%Y-%m-%dT%H:%M:%S"
WE_HAVE_V2_ALERTS_SINCE = datetime.date(2017, 11, 6)
WE_HAVE_V3_ALERTS_SINCE = datetime.date(2024, 4, 12)


def bucket_by(
    items: List[any],
    key_getter: Union[str, Callable[[Any], str]],
) -> Dict[str, List[any]]:
    """Group items into lists keyed by a common value.

    Args:
      items: The list of items to group.
      key_getter: A dict key string or callable that extracts the grouping key from each item.

    Returns:
      dict: A dict mapping each key to a list of items with that key.
    """
    res = {}
    if isinstance(key_getter, str):
        key_getter_as_str = key_getter
        key_getter = lambda dict: dict[key_getter_as_str]
    for item in items:
        key = key_getter(item)
        res.setdefault(key, [])
        res[key].append(item)
    return res


def index_by(items: List[any], key_getter: Union[str, Callable[[Any], str]]):
    """Create a dict indexing items by a unique key. Later items overwrite earlier ones.

    Args:
      items: The list of items to index.
      key_getter: A dict key string or callable that extracts the index key from each item.

    Returns:
      dict: A dict mapping each key to a single item.
    """
    res = {}
    if isinstance(key_getter, str):
        key_getter_as_str = key_getter
        key_getter = lambda dict: dict[key_getter_as_str]
    for item in items:
        key = key_getter(item)
        res[key] = item
    return res


def date_range(start_date: date, end_date: date):
    """Yield each date from start_date to end_date, inclusive.

    Args:
      start_date: date: The first date in the range.
      end_date: date: The last date in the range (inclusive).

    Yields:
      date: Each successive date.
    """
    now = start_date
    while now <= end_date:
        yield now
        now = now + timedelta(days=1)


def stamp_to_dt(stamp):
    """Convert a Unix timestamp to a formatted datetime string in Eastern time.

    Args:
      stamp: Unix timestamp (int or string).

    Returns:
      str: Datetime string in "YYYY-MM-DDTHH:MM:SS" format.
    """
    stamp = int(stamp)
    dt = datetime.datetime.fromtimestamp(stamp, pytz.timezone("America/New_York"))
    return dt.strftime(DATE_FORMAT)


def is_bus(stops):
    """Check if all stops in the list are bus stops.

    Args:
      stops: List of stop ID strings.

    Returns:
      bool: True if every stop matches the bus stop pattern.
    """
    return all(map(s3.is_bus, stops))


def is_cr(stops):
    """Check if all stops in the list are commuter rail stops.

    Args:
      stops: List of stop ID strings.

    Returns:
      bool: True if every stop matches the commuter rail stop pattern.
    """
    return all(map(s3.is_cr, stops))


def use_S3(date, bus=False):
    """Determine whether to use S3-based data for the given date.

    Returns True for bus data or for dates older than 90 days (archival).

    Args:
      date: The date to check.
      bus: Whether the query is for bus data. (Default value = False)

    Returns:
      bool: True if S3 data should be used.
    """
    archival = (date.today() - date).days >= 90
    return archival or bus


def headways(start_date: date, stops, end_date: date | None = None):
    """Retrieve headway data for the given stops and date range from S3.

    Args:
      start_date: date: Start date (used as single date if end_date is None).
      stops: List of stop IDs.
      end_date: date | None: End date (inclusive). If None, uses start_date only.

    Returns:
      list[dict]: Headway event data.
    """
    if end_date is None:
        return s3_historical.headways(stops, start_date, start_date)

    return s3_historical.headways(stops, start_date, end_date)


# Transit days run 3:30am-3:30am local time
def current_transit_day():
    """Return today's transit day date, accounting for the 3:30 AM day boundary."""
    bos_tz = pytz.timezone("America/New_York")
    now = bos_tz.localize(datetime.datetime.now())
    today = now.date()
    if now >= now.replace(hour=0, minute=0) and now < now.replace(hour=3, minute=30):
        today -= datetime.timedelta(days=1)
    return today


def travel_times(start_date: date, from_stops, to_stops, end_date: date | None = None):
    """Retrieve travel time data between stop pairs for the given date range from S3.

    Args:
      start_date: date: Start date (used as single date if end_date is None).
      from_stops: List of origin stop IDs.
      to_stops: List of destination stop IDs.
      end_date: date | None: End date (inclusive). If None, uses start_date only.

    Returns:
      list[dict]: Travel time event data.
    """
    if end_date is None:
        return s3_historical.travel_times(from_stops, to_stops, start_date, start_date)

    return s3_historical.travel_times(from_stops, to_stops, start_date, end_date)


def dwells(start_date, stops, end_date: date | None = None):
    """Retrieve dwell time data for the given stops and date range from S3.

    Args:
      start_date: Start date (used as single date if end_date is None).
      stops: List of stop IDs.
      end_date: date | None: End date (inclusive). If None, uses start_date only.

    Returns:
      list[dict]: Dwell time event data.
    """
    if end_date is None:
        return s3_historical.dwells(stops, start_date, start_date)

    return s3_historical.dwells(stops, start_date, end_date)


def alerts(day: date, params):
    """Retrieve and flatten alert data for a given date and route(s) from S3.

    Fetches v2 alerts (2017-11-06 to 2024-04-12) or v3 alerts (after 2024-04-12),
    then flattens alert versions into a list of {valid_from, valid_to, text} dicts.

    Args:
      day: date: The date to fetch alerts for.
      params: Dict containing "route" key with route ID(s).

    Returns:
      list[dict] | None: Flattened alert entries, or None if no data is available.
    """
    try:
        # Use the API for today and yesterday's transit day, otherwise us.
        if day >= WE_HAVE_V2_ALERTS_SINCE and day <= WE_HAVE_V3_ALERTS_SINCE:
            # This is stupid because we're emulating MBTA-performance ick
            alert_items = s3_alerts.get_v2_alerts(day, params["route"])
        elif day >= WE_HAVE_V3_ALERTS_SINCE:
            # fetch s3 v3 data
            alert_items = s3_alerts.get_v3_alerts(day, params["route"])
        else:
            return None

        # get data
        flat_alerts = []
        for alert_item in alert_items:
            if "alert_versions" in alert_item:
                try:
                    for alert_version in alert_item["alert_versions"]:
                        flat_alerts.append(
                            {
                                "valid_from": stamp_to_dt(int(alert_version["valid_from"])),
                                "valid_to": stamp_to_dt(int(alert_version["valid_to"])),
                                "text": alert_version["header_text"],
                            }
                        )
                except KeyError as e:
                    print(f"Handled KeyError: Couldn't access {e} from alert {alert_item}")
            elif "attributes" in alert_item and any(
                alert_item["attributes"]["effect"] == x for x in ["DETOUR", "DELAY", "STOP_CLOSURE", "SERVICE_CHANGE"]
            ):
                try:
                    for alert_version in alert_item["attributes"]["active_period"]:
                        flat_alerts.append(
                            {
                                "valid_from": alert_version["start"],
                                "valid_to": alert_version["end"],
                                "text": alert_item["attributes"]["header"] or alert_item["attributes"]["short_header"],
                            }
                        )
                except KeyError as e:
                    print(f"Handled KeyError: Couldn't access {e} from alert {alert_item}")
        return flat_alerts
    except Exception:
        traceback.print_exc()
        return None
