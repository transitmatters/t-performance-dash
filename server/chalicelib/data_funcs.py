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
    res = {}
    if isinstance(key_getter, str):
        key_getter_as_str = key_getter
        key_getter = lambda dict: dict[key_getter_as_str]
    for item in items:
        key = key_getter(item)
        res[key] = item
    return res


def date_range(start_date: date, end_date: date):
    now = start_date
    while now <= end_date:
        yield now
        now = now + timedelta(days=1)


def stamp_to_dt(stamp):
    stamp = int(stamp)
    dt = datetime.datetime.fromtimestamp(stamp, pytz.timezone("America/New_York"))
    return dt.strftime(DATE_FORMAT)


def is_bus(stops):
    return all(map(s3.is_bus, stops))


def is_cr(stops):
    return all(map(s3.is_cr, stops))


def use_S3(date, bus=False):
    archival = (date.today() - date).days >= 90
    return archival or bus


def headways(start_date: date, stops, end_date: date | None = None):
    if end_date is None:
        return s3_historical.headways(stops, start_date, start_date)

    return s3_historical.headways(stops, start_date, end_date)


# Transit days run 3:30am-3:30am local time
def current_transit_day():
    bos_tz = pytz.timezone("America/New_York")
    now = bos_tz.localize(datetime.datetime.now())
    today = now.date()
    if now >= now.replace(hour=0, minute=0) and now < now.replace(hour=3, minute=30):
        today -= datetime.timedelta(days=1)
    return today


def travel_times(start_date: date, from_stops, to_stops, end_date: date | None = None):
    if end_date is None:
        return s3_historical.travel_times(from_stops, to_stops, start_date, start_date)

    return s3_historical.travel_times(from_stops, to_stops, start_date, end_date)


def dwells(start_date, stops, end_date: date | None = None):
    if end_date is None:
        return s3_historical.dwells(stops, start_date, start_date)

    return s3_historical.dwells(stops, start_date, end_date)


def alerts(day: date, params):
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
                                "text": alert_item["attributes"]["short_header"] or alert_item["attributes"]["header"],
                            }
                        )
                except KeyError as e:
                    print(f"Handled KeyError: Couldn't access {e} from alert {alert_item}")
        return flat_alerts
    except Exception:
        traceback.print_exc()
        return None
