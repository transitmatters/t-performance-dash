"""Retrieval and filtering of v2 and v3 transit alert data from S3."""

from datetime import date
import json
from chalicelib import s3


def routes_for_alert(alert):
    """Extracts all route IDs associated with an alert.

    Supports both v2 alerts (with ``alert_versions``) and v3 alerts
    (with ``attributes``).

    Args:
        alert (dict): A single alert object from the MBTA alerts data.

    Returns:
        set[str]: Route IDs referenced by the alert's informed entities.
    """
    routes = set()

    if "alert_versions" in alert:
        try:
            for alert_version in alert["alert_versions"]:
                for informed_entity in alert_version["informed_entity"]:
                    if "route_id" in informed_entity:
                        routes.add(informed_entity["route_id"])
        except KeyError as e:
            print(f"Handled KeyError: Couldn't access {e} from alert {alert}")
    elif "attributes" in alert:
        try:
            for informed_entity in alert["attributes"]["informed_entity"]:
                if "route" in informed_entity:
                    routes.add(informed_entity["route"])
        except KeyError as e:
            print(f"Handled KeyError: Couldn't access {e} from alert {alert}")

    return routes


def key(day, v3: bool = False):
    """Constructs the S3 object key for a given day's alert data.

    Args:
        day: The date for which to retrieve alerts.
        v3 (bool): If True, returns the key for v3 alert data. Defaults to False.

    Returns:
        str: The S3 key path for the alert file (e.g. ``Alerts/v3/2024-01-01.json.gz``).
    """
    if v3:
        return f"Alerts/v3/{str(day)}.json.gz"
    return f"Alerts/{str(day)}.json.gz"


def lamp_key(day):
    """Constructs the S3 object key for a given day's LAMP-derived alert data.

    Args:
        day: The date for which to retrieve alerts.

    Returns:
        str: The S3 key path for the alert file (e.g. ``Alerts/lamp/2024-01-01.json.gz``).
    """
    return f"Alerts/lamp/{str(day)}.json.gz"


def _filter_by_route(alerts, routes):
    """Filters an iterable of alert objects down to those touching any of ``routes``.

    Args:
        alerts: Iterable of alert objects (v2, v3, or LAMP -- routes_for_alert handles both shapes).
        routes: Route IDs to filter by; no filtering is applied if falsy.

    Returns:
        list[dict]: Alerts that affect at least one route in ``routes``, or all of them if ``routes`` is falsy.
    """

    def matches_route(alert):
        if not routes:
            return True
        targets = routes_for_alert(alert)
        return any(r in targets for r in routes)

    return list(filter(matches_route, alerts))


def get_v2_alerts(day: date, routes):
    """Downloads and filters v2 alerts from S3 for a given day and set of routes.

    Args:
        day (date): The date for which to retrieve alerts.
        routes: Route IDs to filter by.

    Returns:
        list[dict]: Alerts from the v2 feed that affect at least one of the given routes.
    """
    alerts_str = s3.download(key(day), "utf8")
    alerts = json.loads(alerts_str)[0]["past_alerts"]
    return _filter_by_route(alerts, routes)


def get_v3_alerts(day: date, routes: list[str]):
    """Downloads and filters v3 alerts from S3 for a given day and set of routes.

    Args:
        day (date): The date for which to retrieve alerts.
        routes (list[str]): Route IDs to filter by.

    Returns:
        list[dict]: Alerts from the v3 feed that affect at least one of the given routes.
    """
    alerts_str = s3.download(key(day, v3=True), "utf8")
    alerts = json.loads(alerts_str)
    return _filter_by_route(alerts.values(), routes)


def get_lamp_alerts(day: date, routes: list[str]):
    """Downloads and filters LAMP-derived alerts from S3 for a given day and set of routes.

    The file is v3-JSON:API-shaped (a dict of alert id -> object with an
    ``attributes`` key), identical to get_v3_alerts, so it shares the same
    filtering logic and routes_for_alert branch.

    Args:
        day (date): The date for which to retrieve alerts.
        routes (list[str]): Route IDs to filter by.

    Returns:
        list[dict]: Alerts derived from LAMP that affect at least one of the given routes.
    """
    alerts_str = s3.download(lamp_key(day), "utf8")
    alerts = json.loads(alerts_str)
    return _filter_by_route(alerts.values(), routes)
