import os
import json
import datetime
import pytz
from urllib.request import Request, urlopen
from urllib.parse import urlencode
from decimal import Decimal
import itertools

def get_datetimes(day):
    # has to start after 3:30am, east coast time
    bos_tz = pytz.timezone("America/New_York")
    start_time = datetime.time(3, 30, 1)

    # build from and to datetimes for a single day
    from_dt = bos_tz.localize(datetime.datetime.combine(day, start_time))
    to_dt = from_dt + datetime.timedelta(days=1, seconds=-1)

    # build dict to pass to next
    dt_str = {}
    dt_str["from_dt_str"] = str(int(from_dt.timestamp()))
    dt_str["to_dt_str"] = str(int(to_dt.timestamp()))
    return dt_str

def get_single_url(day, module, params):
    # import api key & set base url
    base_url_v2 = "http://realtime.mbta.com/developer/api/v2.1/{command}?{parameters}"

    # get datetimes
    dt_str = get_datetimes(day)

    # format parameters
    params["format"] = "json"
    params["api_key"] = 'ssFWHiAXuEKz8qpfkBRPeQ'
    params["from_datetime"] = dt_str.get("from_dt_str")
    params["to_datetime"] = dt_str.get("to_dt_str")

    # build url
    url = base_url_v2.format(command=module, parameters=urlencode(params))
    return url

def product_dict(**kwargs):
    keys = kwargs.keys()
    vals = kwargs.values()
    for instance in itertools.product(*vals):
        yield dict(zip(keys, instance))

def get_many_urls(day, module, params):  
    exploded_params = list(product_dict(**params)) #get all possible paramater combinations
    
    url_list = []
    # get url for each pair, add to list
    for single_param in exploded_params:
        url_list.append(get_single_url(day, module, single_param))
    return url_list

def get_single_api_data(url):
    print('Requesting data from URL: {}'.format(url))
    req = Request(url)
    response = urlopen(req).read()
    data = json.loads(response.decode("utf-8"), parse_float=Decimal, parse_int=Decimal)
    return data

def get_api_data(day, module, params):
    url_list = get_many_urls(day, module, params)
    
    all_data = []
    
    for url in url_list:
        data = get_single_api_data(url=url)
        all_data.append(data)
    
    return all_data
