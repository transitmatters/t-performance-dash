from urllib.parse import urlencode
import requests
import json_api_doc
import os

from .secrets import MBTA_V3_API_KEY

BASE_URL_V3 = 'https://api-v3.mbta.com/{command}?{parameters}'

def getV3(command, params={}, raw=False):
    """Make a GET request against the MBTA v3 API"""
    headers = {'x-api-key': MBTA_V3_API_KEY} if api_key else {}
    url = BASE_URL_V3.format(command=command, parameters=urlencode(params))
    print('Requesting from url: {}'.format(url))
    response = requests.get(url, headers=headers)
    if raw:
        return response.json()
    else:
        return json_api_doc.parse(response.json())