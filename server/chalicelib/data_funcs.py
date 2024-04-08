import datetime
import pytz
import traceback
from datetime import date, timedelta
from typing import Dict, Any, Callable, List, Union
from chalicelib import MbtaPerformanceAPI, s3_historical, s3_alerts, s3

DATE_FORMAT = "%Y-%m-%dT%H:%M:%S"
WE_HAVE_ALERTS_SINCE = datetime.date(2017, 11, 6)


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


def alerts(day, params):
    try:
        # Grab the current "transit day" (3:30am-3:30am)
        today = current_transit_day()
        # yesterday + 1 bonus day to cover the gap, since aws is only populated at 5/6am.
        yesterday = today - datetime.timedelta(days=2)

        # TODO: Handle either format (v2 or v3) of alerts
        # Use the API for today and yesterday's transit day, otherwise us.
        if day >= yesterday:
            # TODO: Replace v2 calls with v3
            api_data = MbtaPerformanceAPI.get_api_data("pastalerts", params, day)
        elif day >= WE_HAVE_ALERTS_SINCE:
            # This is stupid because we're emulating MBTA-performance ick
            api_data = [{"past_alerts": s3_alerts.get_alerts(day, params["route"])}]
        else:
            return None

        # combine all alerts data
        alert_items = []
        for dict_data in api_data:
            alert_items = alert_items + dict_data.get("past_alerts", [])

        # get data
        flat_alerts = []
        for alert_item in alert_items:
            for alert_version in alert_item["alert_versions"]:
                flat_alerts.append(
                    {
                        "valid_from": stamp_to_dt(int(alert_version["valid_from"])),
                        "valid_to": stamp_to_dt(int(alert_version["valid_to"])),
                        "text": alert_version["header_text"],
                    }
                )
        return flat_alerts
    except Exception:
        traceback.print_exc()
        return None
