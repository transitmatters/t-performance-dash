import json

import requests

with open("common/constants/stations.json", "r") as f:
    stations = json.loads(f.read())

stations_by_platform_id = {}
stations_by_id = {}

###
# Accessibility

accessibility_by_station = {}

ids = set()
for line in stations:
    for ss in stations[line]["stations"]:
        if ss["station"] in stations_by_id:
            stations_by_id[ss["station"]].append(ss)
        else:
            stations_by_id[ss["station"]] = [ss]
        for stop in ss["stops"]:
            for platform in ss["stops"][stop]:
                stations_by_platform_id[platform] = ss
                ids.add(platform)

r_s = requests.get(f'https://api-v3.mbta.com/stops?filter[id]={",".join(ids)}')
stops = r_s.json()

for platform in stops["data"]:
    station_id = platform["relationships"]["parent_station"]["data"]["id"]

    accessibility_by_station[station_id] = accessibility_by_station.get(station_id, dict())
    accessibility_by_station[station_id][platform["id"]] = platform["attributes"]["wheelchair_boarding"]

for station_id, val in accessibility_by_station.items():
    # Mark as accessible if and only if all platforms are accessible
    if station_id in stations_by_id:
        for indx, item in enumerate(stations_by_id[station_id]):
            stations_by_id[station_id][indx]["accessible"] = all(
                map((1).__eq__, accessibility_by_station[station_id].values())
            )
        # stations_by_id[station_id]['accessible_platforms'] = {p_id: whl == 1 for p_id, whl in val.items()}


###
# Bike facilities

r_f = requests.get(
    f'https://api-v3.mbta.com/facilities?filter[type]=BIKE_STORAGE&filter[stop]={",".join(stations_by_id.keys())}'
)
bike_storage = r_f.json()

bike_facilities_by_station_id = {}

for facility in bike_storage["data"]:
    station_id = facility["relationships"]["stop"]["data"]["id"]

    enclosed = False
    secured = False

    for prop in facility["attributes"]["properties"]:
        if prop["name"] == "enclosed" and prop["value"] == 1:
            enclosed = True
        if prop["name"] == "secured" and prop["value"] == 1:
            secured = True

    for indx, item in enumerate(stations_by_id[station_id]):
        if enclosed:
            stations_by_id[station_id][indx]["enclosed_bike_parking"] = True

        if enclosed and secured:
            stations_by_id[station_id][indx]["pedal_park"] = True


with open("common/constants/stations.json", "w") as f:
    json.dump(stations, f, indent=2)
