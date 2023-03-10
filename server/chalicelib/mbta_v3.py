from decimal import Decimal
import json
from multiprocessing.dummy import active_children
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
        formatted_key = f'filter[{key}]' #This is how the mbta api expects the parameters
        formatted_params[formatted_key] = value
    return urlencode(formatted_params)

'''Format alerts for shuttling'''
def shuttle_alert(attributes):
    stops = []
    for entity in attributes['informed_entity']:
        if entity.get('stop') and entity['stop'].isdigit(): # Ignore stops of format `place-brntn`
            stops.append(int(entity['stop']))
    return {
        "type": attributes['effect'],
        "stops": stops, "header": attributes['header'],
        "active_period": format_active_alerts(attributes['active_period'])
        }

def format_response(alerts_data):
    alerts_filtered = []
    for alert in alerts_data:
        attributes = alert['attributes']
        if attributes['effect'] == 'SHUTTLE':
            alerts_filtered.append(shuttle_alert(attributes))
    return alerts_filtered

'''
Append a field to each time period on the alert to determine:
1) If the period is current (ongoing or starts today)
2) If the period is upcoming (affects a day beyond today)

These two things are not mutually exclusive.
'''
def get_active(alert_period):
    start = bos_tz.localize(datetime.fromisoformat(alert_period['start'][:-6]))
    end = bos_tz.localize(datetime.fromisoformat(alert_period['end'][:-6]))
    today = bos_tz.localize(datetime(now.year, now.month, now.day))
    
    end_tomorrow = today + timedelta(days=1, hours=4) # Anything before 4 am is "today"
    if end <= now:
        alert_period['current'] = False
        alert_period['upcoming'] = False
        return alert_period # Already past
    if end <= end_tomorrow:
        alert_period['current'] = True
        alert_period['upcoming'] = False
        return alert_period # Ends today
    if start <= end_tomorrow:
        alert_period['current'] = True
        alert_period['upcoming'] = True
        return alert_period # Starts Today but ends later than today.
    alert_period['upcoming'] = True
    alert_period['current'] = False
    return alert_period # Starts after today


def format_active_alerts(alert_active_period):
    return list(map(get_active, alert_active_period))

"""Make a GET request against the MBTA v3 API"""
def getV3(command, params={}):
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