import json
import sys

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


####
# Station distances
# this could be its own file lol
def get_station_distances():
    """
    {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "id": 1,
          "geometry": null,
          "properties": {
            "route_id": "Blue",
            "direction_id": 0,
            "route_pattern_name": "Wonderland - Bowdoin",
            "from_stop_id": "70059",
            "from_station_id": "place-wondl",
            "from_stop_name": "Wonderland",
            "to_stop_id": "70057",
            "to_station_id": "place-rbmnl",
            "to_stop_name": "Revere Beach",
            "from_to_meters": 648.07954,
            "cumulative_meters": 648.07954,
            "from_to_miles": 0.402697956434423,
            "cumulative_miles": 0.402697956434423,
            "ObjectId": 1
          }
        },
        ...
    }
    """

    # stop id => distance to other reachable stops on the same route
    stop_distances = {}

    # station id => distance to other reachable stations on all routes
    station_distances = {}

    # station id => route id that the station is on
    # the route id in this case is basically just the line
    station_lines = {}

    # stop id => direction of stop
    stop_directions = {}

    # stop id => station that the stop is on
    stop_stations = {}

    stop_distance_response = requests.get(
        f"https://services1.arcgis.com/ceiitspzDAHrdGO1/arcgis/rest/services/MBTA_Rapid_Transit_Stop_Distances/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson"
    )

    stop_response_json = stop_distance_response.json()
    for feature in stop_response_json["features"]:
        distance_details = feature["properties"]

        from_stop_id = distance_details["from_stop_id"]
        to_stop_id = distance_details["to_stop_id"]

        # ignore stations we don't have data for
        if distance_details["from_station_id"] not in stations_by_id:
            continue

        from_stop_distances = stop_distances.get(from_stop_id, {})
        from_stop_distances[to_stop_id] = distance_details["from_to_miles"]

        stop_distances[from_stop_id] = from_stop_distances
        # route pattern name is more detaield than id - e.g. route_id is always Red for all routes
        stop_directions[from_stop_id] = distance_details["direction_id"]
        stop_stations[from_stop_id] = distance_details["from_station_id"]

        # set this just in case the to station is a terminus
        stop_directions[to_stop_id] = distance_details["direction_id"]
        stop_stations[to_stop_id] = distance_details["to_station_id"]

        station_lines[distance_details["from_station_id"]] = distance_details["route_id"]
        station_lines[distance_details["to_station_id"]] = distance_details["route_id"]

    def get_station_id(stop_id):
        return stop_stations[stop_id]

    # there is probably still a more efficient way to do this.
    def populate_distances(target_stop_id):
        stop_stack = []

        # assume each stop starts with one destination
        first_dest, first_dist = next(iter(stop_distances[target_stop_id].items()))
        stop_stack.append((first_dest, first_dist))

        current_stop_distances = {}

        target_station = get_station_id(target_stop_id)
        target_station_distances = station_distances.get(target_station, dict())

        while len(stop_stack) > 0:
            dest, dist = stop_stack.pop()
            destination_station = get_station_id(dest)
            target_station_distances[destination_station] = dist

            # distance is a symmetric relationship, so set the distance here for those routes that have a direction id change
            destination_station_distances = station_distances.get(destination_station, dict())
            destination_station_distances[target_station] = dist

            current_stop_distances[dest] = dist

            # This should be a terminus
            if dest not in stop_distances or stop_distances[dest] == None or len(stop_distances[dest]) == 0:
                break

            for child, child_distance in stop_distances[dest].items():
                if stop_directions[child] == stop_directions[target_stop_id]:
                    stop_stack.append((child, dist + child_distance))

        station_distances[target_station] = target_station_distances

        return current_stop_distances

    # traverse the list, getting distances for all stops reachable by this stop
    for stop_id in stop_distances:
        stop_distances[stop_id] = populate_distances(stop_id)

    return station_distances


station_distances = get_station_distances()


with open("common/constants/station_distances.json", "w") as f:
    json.dump(station_distances, f, indent=2)

with open("common/constants/stations.json", "w") as f:
    json.dump(stations, f, indent=2)
