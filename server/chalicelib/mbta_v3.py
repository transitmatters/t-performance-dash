from decimal import Decimal
import json
from urllib.parse import urlencode
import os
import requests
import pytz
from datetime import datetime, timedelta

bos_tz = pytz.timezone("America/New_York")
now = bos_tz.localize(datetime.now())

BASE_URL_V3 = "https://api-v3.mbta.com/{command}?{parameters}"


def format_parameters(params={}):
    formatted_params = {}
    for key, value in params.items():
        formatted_key = f'filter[{key}]'  # This is how the mbta api expects the parameters
        formatted_params[formatted_key] = value
    return urlencode(formatted_params)


def shuttle_alert(attributes, id):
    '''Format alerts for shuttling'''
    stops = set()  # Eliminate duplicates (bus alerts sometimes have entries for multiple routes for one stop.)
    for entity in attributes['informed_entity']:
        if entity.get('stop') and entity['stop'].isdigit():  # Ignore stops of format `place-brntn`
            stops.add(int(entity['stop']))
    return {
        "id": id,
        "stops": list(stops),
        "header": attributes['header'],
        "type": attributes['effect'],
        "active_period": format_active_alerts(attributes['active_period'])
    }


def delay_alert(attributes, id):
    '''Format alerts for delays'''
    routes = []
    stops = set()  # Eliminate duplicates (bus alerts sometimes have entries for multiple routes for one stop.)
    for entity in attributes['informed_entity']:
        if entity.get('stop') and entity['stop'].isdigit():  # Ignore stops of format `place-brntn`
            stops.add(int(entity['stop']))
        if entity.get('route') and entity.get('route') != 'Mattapan':
            routes.append(entity['route'])
    return {
        "id": id,
        "routes": routes,
        "stops": list(stops),
        "header": attributes['header'],
        "type": attributes['effect'],
        "active_period": format_active_alerts(attributes['active_period'])
    }


def format_response(alerts_data):  # TODO: separate logic for bus to avoid repeat stops.
    alerts_filtered = []
    for alert in alerts_data:
        attributes = alert['attributes']
        if attributes['effect'] == 'SHUTTLE' or attributes['effect'] == 'SUSPENSION' or attributes['effect'] == 'STOP_CLOSURE':
            alerts_filtered.append(shuttle_alert(attributes, alert['id']))
        if attributes['effect'] == 'DELAY' or attributes['effect'] == 'DETOUR':
            alerts_filtered.append(delay_alert(attributes, alert['id']))

    return alerts_filtered


def get_active(alert_period):
    '''
    Append a field to each time period on the alert to determine:
    1) If the period is current (ongoing or starts today)
    2) If the period is upcoming (affects a day beyond today)

    These two things are not mutually exclusive.
    '''
    if alert_period['end'] is None:
        alert_period['current'] = True
        alert_period['upcoming'] = False
        return alert_period  # No end date

    start = bos_tz.localize(datetime.fromisoformat(alert_period['start'][:-6]))
    end = bos_tz.localize(datetime.fromisoformat(alert_period['end'][:-6]))
    today = bos_tz.localize(datetime(now.year, now.month, now.day))

    end_tomorrow = today + timedelta(days=1, hours=4)  # Anything before 4 am is "today"
    end_today = today + timedelta(hours=11, minutes=59)

    if end <= now:
        alert_period['current'] = False
        alert_period['upcoming'] = False
        return alert_period  # Already past
    if end <= end_tomorrow:
        alert_period['current'] = True
        alert_period['upcoming'] = False
        return alert_period  # Ends today
    if start <= end_today:
        alert_period['current'] = True
        alert_period['upcoming'] = True
        return alert_period  # Starts Today but ends later than today.
    alert_period['upcoming'] = True
    alert_period['current'] = False
    return alert_period  # Starts after today


def format_active_alerts(alert_active_period):
    return list(map(get_active, alert_active_period))


def getV3(command, params={}):
    """Make a GET request against the MBTA v3 API"""
    url = BASE_URL_V3.format(command=command, parameters=format_parameters(params))
    api_key = os.environ.get("MBTA_V3_API_KEY", "")
    headers = {"x-api-key": api_key} if api_key else {}
    response = requests.get(url, headers=headers)
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError:
        print(response.content.decode("utf-8"))
        raise  # TODO: catch this gracefully
    data = json.loads(response.content.decode("utf-8"), parse_float=Decimal, parse_int=Decimal)
    return format_response(data['data'])
