from decimal import Decimal
import json
from urllib.parse import urlencode
import os
import requests

BASE_URL_V3 = "https://api-v3.mbta.com/{command}?{parameters}"

def formatParameters(params={}):
    formatted_params = {}
    for key, value in params.items():
        formatted_key = f'filter[{key}]' #This is how the mbta api expects the parameters
        formatted_params[formatted_key] = value
    return urlencode(formatted_params)

def shuttle_alert(attributes):
    stops = []
    for entity in attributes['informed_entity']:
        if entity.get('stop') and entity['stop'].isdigit():
            stops.append(int(entity['stop']))
    return {"type": attributes['effect'], "stops": stops, "header": attributes['header'], "active_period": attributes['active_period']}

def formatResponse(alerts_data):
    alerts_filtered = []
    for alert in alerts_data:
        attributes = alert['attributes']
        if attributes['effect'] == 'SHUTTLE':
            alerts_filtered.append(shuttle_alert(attributes))
    return alerts_filtered

def getV3(command, params={}):
    """Make a GET request against the MBTA v3 API"""
    url = BASE_URL_V3.format(command=command, parameters=formatParameters(params))
    api_key = os.environ.get("MBTA_V3_API_KEY", "")
    headers = {"x-api-key": api_key} if api_key else {}
    response = requests.get(url, headers=headers)
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError:
        print(response.content.decode("utf-8"))
        raise  # TODO: catch this gracefully
    data = json.loads(response.content.decode("utf-8"), parse_float=Decimal, parse_int=Decimal)
    return formatResponse(data['data'])

