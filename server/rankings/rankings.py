from ast import List
from collections import defaultdict
import datetime
import os
import pandas as pd

from underground import metadata, SubwayFeed
API_KEY = os.getenv('MTA_API_KEY')
ROUTE = 'Q'

if not API_KEY:
    print("Set MTA_API_KEY before running")
    exit()

routes = ["A", "G", "Q", "1", "B", "J", "L"]

avg_headsways_dict = {}

def avg_headway(timestamps) -> datetime.timedelta:
    mx = max(timestamps)
    mn = min(timestamps)
    if len(timestamps) > 1:
        avg = (mx-mn)/(len(timestamps)-1)
    else:
        avg = (mx-mn)/(len(timestamps))
    return avg

# I am not a data scientist, there is probably a more statistically correct way to calculate this
# This roughly works as a proof-of-concept
for route in routes:
    feed = SubwayFeed.get(route, api_key=API_KEY)

    stops_dict = feed.extract_stop_dict()

    for route_id in stops_dict:
        avg_headsways_dict[route_id]= {}
        for stop_id in stops_dict[route_id]:
            avg_headsways_dict[route_id][stop_id] = avg_headway(stops_dict[route_id][stop_id])

total_system_average = []

for route_id in avg_headsways_dict:
    total_system_average.append(pd.to_timedelta(pd.Series(avg_headsways_dict[route_id])).mean())
    print(route_id, pd.to_timedelta(pd.Series(avg_headsways_dict[route_id])).mean())
print("Total System: ", pd.to_timedelta(pd.Series(total_system_average)).mean())
