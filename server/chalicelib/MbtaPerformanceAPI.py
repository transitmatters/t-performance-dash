import json
import datetime
import pytz
from urllib.request import Request, urlopen
from urllib.parse import urlencode
from decimal import Decimal
import itertools

from .secrets import MBTA_V2_API_KEY


def get_timestamps(day):
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


def get_timestamp_range(start_day, end_day=None):
    if end_day:
        a = get_timestamps(start_day)
        z = get_timestamps(end_day)
        dt_str = {}
        dt_str["from_dt_str"] = a["from_dt_str"]
        dt_str["to_dt_str"] = z["to_dt_str"]
        return dt_str
    else:
        return get_timestamps(start_day)


def get_single_url(start_day, module, params, end_day=None):
    # import api key & set base url
    base_url_v2 = "http://realtime.mbta.com/developer/api/v2.1/{command}?{parameters}"

    # get datetimes
    dt_str = get_timestamp_range(start_day, end_day)

    # format parameters
    params["format"] = "json"
    params["api_key"] = MBTA_V2_API_KEY
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


def get_product_of_list_dict_values(dict_of_lists):
    keys = dict_of_lists.keys()
    values = dict_of_lists.values()
    for combination in itertools.product(*values):
        yield dict(zip(keys, combination))


def get_many_urls(start_day, module, params, end_day=None):
    exploded_params = list(
        get_product_of_list_dict_values(params)
    )  # get all possible parameter combinations
    url_list = []
    # get url for each pair, add to list
    for single_param in exploded_params:
        url_list.append(get_single_url(start_day, module, single_param, end_day))
    return url_list


def get_single_api_data(url):
    print("Requesting data from URL: {}".format(url))
    req = Request(url)
    response = urlopen(req).read()
    data = json.loads(response.decode("utf-8"), parse_float=Decimal, parse_int=Decimal)
    return data


def get_api_data(start_day, module, params, end_day=None):
    url_list = get_many_urls(start_day, module, params, end_day)
    all_data = []
    for url in url_list:
        data = get_single_api_data(url=url)
        all_data.append(data)
    return all_data
