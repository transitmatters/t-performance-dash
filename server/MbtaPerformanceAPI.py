# -*- coding: utf-8 -*-
"""
Created on Fri May  3 19:14:26 2019

@author: cfrie
"""

import os
import json
import secrets
from datetime import datetime, timedelta, time
from urllib.request import Request, urlopen
from urllib.parse import urlencode
from decimal import Decimal


def get_datetimes(day):
    # has to start after 3:30am
    start_time = time(3, 30, 1)

    # build from and to datetimes for a single day
    from_dt = datetime.combine(day, start_time)
    to_dt = from_dt + timedelta(days=1, seconds=-1)

    # build dict to pass to next
    dt_str = {}
    dt_str["from_dt_str"] = str(int(from_dt.timestamp()))
    dt_str["to_dt_str"] = str(int(to_dt.timestamp()))
    return dt_str


def get_url(day, module, params):
    # import api key & set base url
    base_url_v2 = "http://realtime.mbta.com/developer/api/v2.1/{command}?{parameters}"

    # get datetimes
    dt_str = get_datetimes(day)

    # format parameters
    params["format"] = "json"
    params["api_key"] = secrets.MBTA_V2_API_KEY
    params["from_datetime"] = dt_str.get("from_dt_str")
    params["to_datetime"] = dt_str.get("to_dt_str")

    # build url
    url = base_url_v2.format(command=module, parameters=urlencode(params))
    return url


def get_api_data(day, module, params):
    url = get_url(day, module, params)
    print('Requesting data from URL: {}'.format(url))
    req = Request(url)
    response = urlopen(req).read()
    data = json.loads(response.decode("utf-8"), parse_float=Decimal, parse_int=Decimal)
    return data
