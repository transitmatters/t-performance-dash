"""Client for the MBTA v3 API: alert retrieval, formatting, and general v3 queries."""

from decimal import Decimal
import json
from urllib.parse import urlencode
import requests
import pytz
from datetime import datetime, timedelta

from chalicelib import config

bos_tz = pytz.timezone("America/New_York")
now = datetime.now(tz=bos_tz)

BASE_URL_V3 = "https://api-v3.mbta.com/{command}?{parameters}"


def format_parameters(params={}):
    """Wraps parameter keys in MBTA filter syntax and URL-encodes the result.

    Args:
        params (dict): Key-value pairs of filter parameters. Defaults to {}.

    Returns:
        str: URL-encoded query string with keys wrapped as ``filter[key]``.
    """
    formatted_params = {}
    for key, value in params.items():
        formatted_key = f"filter[{key}]"  # This is how the mbta api expects the parameters
        formatted_params[formatted_key] = value
    return urlencode(formatted_params)


def shuttle_alert(attributes, id):
    """Formats a shuttle, suspension, or stop-closure alert from raw MBTA API data.

    Args:
        attributes (dict): The ``attributes`` field of an MBTA alert object.
        id (str): The alert's unique identifier.

    Returns:
        dict: Formatted alert containing ``id``, ``stops``, ``header``, ``type``,
        and ``active_period``. Only ``place-<name>`` stop IDs are included.
    """
    stops = set()  # Eliminate duplicates (bus alerts sometimes have entries for multiple routes for one stop.)
    for entity in attributes["informed_entity"]:
        if entity.get("stop") and not entity["stop"].isdigit():  # Only get `place-<name>` stop types - no numbers.
            stops.add(entity["stop"])
    return {
        "id": id,
        "stops": list(stops),
        "header": attributes["header"],
        "type": attributes["effect"],
        "active_period": format_active_alerts(attributes["active_period"]),
    }


def delay_alert(attributes, id):
    """Formats a delay or detour alert from raw MBTA API data.

    Args:
        attributes (dict): The ``attributes`` field of an MBTA alert object.
        id (str): The alert's unique identifier.

    Returns:
        dict: Formatted alert containing ``id``, ``routes``, ``stops``, ``header``,
        ``type``, and ``active_period``. Only numeric stop IDs are included;
        Mattapan route entries are excluded.
    """
    routes = []
    stops = set()  # Eliminate duplicates (bus alerts sometimes have entries for multiple routes for one stop.)
    for entity in attributes["informed_entity"]:
        if entity.get("stop") and entity["stop"].isdigit():  # Ignore stops of format `place-brntn`
            stops.add(int(entity["stop"]))
        if entity.get("route") and entity.get("route") != "Mattapan":
            routes.append(entity["route"])
    return {
        "id": id,
        "routes": routes,
        "stops": list(stops),
        "header": attributes["header"],
        "type": attributes["effect"],
        "active_period": format_active_alerts(attributes["active_period"]),
    }


def accessibility_alert(attributes, id):
    """Formats an escalator or elevator closure alert from raw MBTA API data.

    Args:
        attributes (dict): The ``attributes`` field of an MBTA alert object.
        id (str): The alert's unique identifier.

    Returns:
        dict: Formatted alert containing ``id``, ``stops``, ``header``,
        ``description``, ``type``, and ``active_period``. Only
        ``place-<name>`` stop IDs are included.
    """
    stops = set()  # Eliminate duplicates (bus alerts sometimes have entries for multiple routes for one stop.)
    for entity in attributes["informed_entity"]:
        if entity.get("stop") and not entity["stop"].isdigit():  # Only get `place-<name>` stop types - no numbers.
            stops.add(entity["stop"])
    return {
        "id": id,
        "stops": list(stops),
        "header": attributes["header"],
        "description": attributes["description"],
        "type": attributes["effect"],
        "active_period": format_active_alerts(attributes["active_period"]),
    }


def format_alerts_response(alerts_data):  # TODO: separate logic for bus to avoid repeat stops.
    """Filters and formats raw alert objects by effect type.

    Handles SHUTTLE, SUSPENSION, STOP_CLOSURE, DELAY, DETOUR,
    ESCALATOR_CLOSURE, and ELEVATOR_CLOSURE effects.

    Args:
        alerts_data (list[dict]): Raw alert objects from the MBTA v3 API response.

    Returns:
        list[dict]: Formatted alert dicts, each shaped by the appropriate
        formatter (``shuttle_alert``, ``delay_alert``, or ``accessibility_alert``).
    """
    alerts_filtered = []
    for alert in alerts_data:
        attributes = alert["attributes"]
        if (
            attributes["effect"] == "SHUTTLE"
            or attributes["effect"] == "SUSPENSION"
            or attributes["effect"] == "STOP_CLOSURE"
        ):
            alerts_filtered.append(shuttle_alert(attributes, alert["id"]))
        if attributes["effect"] == "DELAY" or attributes["effect"] == "DETOUR":
            alerts_filtered.append(delay_alert(attributes, alert["id"]))
        if attributes["effect"] == "ESCALATOR_CLOSURE" or attributes["effect"] == "ELEVATOR_CLOSURE":
            alerts_filtered.append(accessibility_alert(attributes, alert["id"]))

    return alerts_filtered


def get_active(alert_period):
    """Append a field to each time period on the alert to determine:
    1) If the period is current (ongoing or starts today)
    2) If the period is upcoming (affects a day beyond today)

    These two things are not mutually exclusive.

    Args:
      alert_period:

    Returns:

    """
    if alert_period["end"] is None:
        alert_period["current"] = True
        alert_period["upcoming"] = False
        return alert_period  # No end date

    start = bos_tz.localize(datetime.fromisoformat(alert_period["start"][:-6]))
    end = bos_tz.localize(datetime.fromisoformat(alert_period["end"][:-6]))
    today = bos_tz.localize(datetime(now.year, now.month, now.day))

    end_tomorrow = today + timedelta(days=1, hours=4)  # Anything before 4 am is "today"
    end_today = today + timedelta(hours=11, minutes=59)

    if end <= now:
        alert_period["current"] = False
        alert_period["upcoming"] = False
        return alert_period  # Already past
    if end <= end_tomorrow:
        alert_period["current"] = True
        alert_period["upcoming"] = False
        return alert_period  # Ends today
    if start <= end_today:
        alert_period["current"] = True
        alert_period["upcoming"] = True
        return alert_period  # Starts Today but ends later than today.
    alert_period["upcoming"] = True
    alert_period["current"] = False
    return alert_period  # Starts after today


def format_active_alerts(alert_active_period):
    """Applies ``current`` and ``upcoming`` status flags to each period in an alert.

    Args:
        alert_active_period (list[dict]): Active period dicts from an MBTA alert,
            each with ``start`` and ``end`` ISO timestamp strings.

    Returns:
        list[dict]: The same periods with ``current`` and ``upcoming`` boolean
        fields added by ``get_active``.
    """
    return list(map(get_active, alert_active_period))


def getAlerts(params={}):
    """Fetches alerts from the MBTA v3 API and returns them formatted.

    Args:
        params (dict): Optional filter parameters passed to the ``alerts``
            endpoint. Defaults to {}.

    Returns:
        list[dict]: Formatted alert dicts as returned by ``format_alerts_response``.
    """
    response = getV3("alerts", params)
    return format_alerts_response(response["data"])


def getV3(command, params={}):
    """Makes a GET request against the MBTA v3 API.

    Args:
        command (str): The API resource to query (e.g. ``"alerts"``, ``"stops"``).
        params (dict): Optional filter parameters. Defaults to {}.

    Returns:
        dict: Parsed JSON response from the API, with floats and ints represented
        as ``Decimal`` for precision.

    Raises:
        requests.exceptions.HTTPError: If the API returns a non-2xx status code.
    """
    url = BASE_URL_V3.format(command=command, parameters=format_parameters(params))
    api_key = config.MBTA_V3_API_KEY
    headers = {"x-api-key": api_key} if api_key else {}
    response = requests.get(url, headers=headers)
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError:
        print(response.content.decode("utf-8"))
        raise  # TODO: catch this gracefully
    data = json.loads(response.content.decode("utf-8"), parse_float=Decimal, parse_int=Decimal)
    return data
