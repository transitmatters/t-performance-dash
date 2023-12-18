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

    # stop id => route that the stop is on (used to filter the distances)
    stop_routes = {}

    # stop id => station that the stop is on
    stop_stations = {}

    stop_distance_response = requests.get(
        f'https://services1.arcgis.com/ceiitspzDAHrdGO1/arcgis/rest/services/MBTA_Rapid_Transit_Stop_Distances/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson'
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
        stop_routes[from_stop_id] = distance_details["route_pattern_name"]
        stop_stations[from_stop_id] = distance_details["from_station_id"]

        # set this just in case the to station is a terminus
        stop_routes[to_stop_id] = distance_details["route_pattern_name"]
        stop_stations[to_stop_id] = distance_details["to_station_id"]

        station_lines[distance_details["from_station_id"]] = distance_details["route_id"]
        station_lines[distance_details["to_station_id"]] = distance_details["route_id"]



    def get_station_id(stop_id):
        return stop_stations[stop_id]


    # there is probably still a more efficient way to do this.
    def populate_distances(target_stop_id):
        stop_stack = []
        seen_stops = set()
        
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

            current_stop_distances[dest] = dist

            # This should be a terminus
            if dest not in stop_distances or stop_distances[dest] == None or len(stop_distances[dest]) == 0:
                break

            # If a stop is not on the same route as target stop, ignore it
            if stop_routes[target_stop_id] != stop_routes[dest]:
                continue

            # cycles should never happen on the same route.... but for some reason they do?
            if dest in seen_stops:
                continue

            seen_stops.add(dest)

            # again, assuming at this point there is only one destination (to_stop)
            # for each from_stop
            dest_of_dest, dist_of_dest_of_dest = next(iter(stop_distances[dest].items())) 
            stop_stack.append((dest_of_dest, dist + dist_of_dest_of_dest))

        station_distances[target_station] = target_station_distances
        
        return current_stop_distances

    def populate_station_distances(station_id):
        reachable_stations = station_distances[station_id]

        seen_stations = set()

        station_stack = [(k, v) for k, v in reachable_stations.items()] 

        while len(station_stack) > 0:
            other_station_id, other_station_distance = station_stack.pop()

            # for now, only do stations on the same line
            # in the future, you could improve this to do all station pairs
            if station_lines[other_station_id] != station_lines[station_id]:
                continue

            seen_stations.add(other_station_id)

            reachable_stations[other_station_id] = min(reachable_stations.get(other_station_id, float('inf')), other_station_distance)

            if other_station_id not in station_distances:
                continue

            for child, child_distance in station_distances[other_station_id].items():
                if child not in seen_stations:
                    station_stack.append((child, other_station_distance + child_distance))



        return reachable_stations











    # traverse the list, getting distances for all stops reachable by this stop
    for stop_id in stop_distances:
        stop_distances[stop_id] = populate_distances(stop_id)

    # we need to do one dfs of the station graph to connect stations 
    # that are really reachable in one trip, but happen to not be reachable using one route
    # for example, charles mgh => ashmont
    for station_id in station_distances:
        station_distances[station_id] = populate_station_distances(station_id)

    return station_distances


station_distances = get_station_distances()


with open("common/constants/station_distances.json", 'w') as f:
    json.dump(station_distances, f, indent=2)

with open("common/constants/stations.json", "w") as f:
    json.dump(stations, f, indent=2)
