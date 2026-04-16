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

    def matches_route(alert):
        """Checks whether an alert applies to any of the target routes.

        Args:
            alert (dict): A single alert object.

        Returns:
            bool: True if the alert affects at least one route in ``routes``.
        """
        targets = routes_for_alert(alert)
        return any(r in targets for r in routes)

    return list(filter(matches_route, alerts))


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

    def matches_route(alert):
        """Checks whether an alert applies to any of the target routes.

        Args:
            alert (dict): A single alert object.

        Returns:
            bool: True if the alert affects at least one route in ``routes``.
        """
        targets = routes_for_alert(alert)
        return any(r in targets for r in routes)

    return list(filter(matches_route, alerts.values()))
