import json
import datetime
import pytz
import requests
from urllib.parse import urlencode
from decimal import Decimal
import itertools

from chalicelib.parallel import make_parallel

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


def get_single_url(start_day, end_day, module, params):
    # import api key & set base url
    base_url_v2 = "https://realtime.mbta.com/developer/api/v2.1/{command}?{parameters}"

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


def get_product_of_list_dict_values(dict_of_lists):
    keys = dict_of_lists.keys()
    values = dict_of_lists.values()
    for combination in itertools.product(*values):
        yield dict(zip(keys, combination))


def get_many_urls(start_day, end_day, module, params):
    exploded_params = list(
        get_product_of_list_dict_values(params)
    )  # get all possible parameter combinations
    url_list = []
    # get url for each pair, add to list
    for single_param in exploded_params:
        url_list.append(get_single_url(start_day, end_day, module, single_param))
    return url_list


def get_single_api_data(url):
    print("Requesting data from URL: {}".format(url))
    response = requests.get(url)
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError:
        print(response.content.decode("utf-8"))
        raise  # TODO: catch this gracefully
    data = json.loads(response.content.decode("utf-8"), parse_float=Decimal, parse_int=Decimal)
    return data


# This is the primary function, but shouldn't be called directly, see dispatcher below
def _get_api_data(date_interval, module, params):
    start_day, end_day = date_interval
    url_list = get_many_urls(start_day, end_day, module, params)
    all_data = []
    for url in url_list:
        data = get_single_api_data(url=url)
        all_data.append(data)
    return all_data


_multithreaded_api = make_parallel(_get_api_data)


# we offer this convenient wrapper, that also dispatches to multi-threaded if needed
def get_api_data(module, params, start_day, end_day=None):
    if end_day is None:
        return _get_api_data((start_day, None), module, params)
    else:
        return _multithreaded_api(get_7day_chunks(start_day, end_day), module, params)


# MBTA api won't accept queries > 7 days. 6 day interval here because of DST.
# this function operates on datetime.dates
def get_7day_chunks(start, end):
    delta = (end - start).days + 1
    cur = start
    while delta != 0:
        inc = min(delta, 6)  # Stupid DST hour throws us over if we actually use 7.
        yield (cur, cur + datetime.timedelta(days=inc - 1))
        delta -= inc
        cur += datetime.timedelta(days=inc)
