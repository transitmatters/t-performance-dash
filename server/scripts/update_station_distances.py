from typing import Dict, Set, TypeAlias
import json
import requests

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

WeightedGraph: TypeAlias = Dict[str, Dict[str, float]]


# for the purpose of this, we need all the green to be one line
def transform_to_line(route_from_api: str):
    if not route_from_api.startswith("Green"):
        return route_from_api
    else:
        return "Green"


def initialize_interstop_data():
    # stop id => distance to other reachable stops on the same route
    stop_distances: WeightedGraph = {}

    # station id => set containing all lines the station is on
    station_lines: Dict[str, Set[str]] = {}

    # stop id => route of stop
    stop_routes: WeightedGraph = {}

    # stop id => direction of stop
    stop_directions: Dict[str, int] = {}

    # stop id => station that the stop is on
    stop_stations: Dict[str, str] = {}

    stop_distance_response = requests.get(
        "https://services1.arcgis.com/ceiitspzDAHrdGO1/arcgis/rest/services/MBTA_Rapid_Transit_Stop_Distances/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson"
    )

    stop_response_json = stop_distance_response.json()
    for feature in stop_response_json["features"]:
        distance_details = feature["properties"]

        from_stop_id = distance_details["from_stop_id"]
        to_stop_id = distance_details["to_stop_id"]

        from_station_id = distance_details["from_station_id"]
        to_station_id = distance_details["to_station_id"]

        # ignore stations we don't have data for in stations.json
        # if distance_details["from_station_id"] not in stations_by_id:
        #     continue

        from_stop_distances = stop_distances.get(from_stop_id, {})
        from_stop_distances[to_stop_id] = distance_details["from_to_miles"]

        stop_distances[from_stop_id] = from_stop_distances
        # route pattern name is more detaield than id - e.g. route_id is always Red for all routes
        stop_routes[from_stop_id] = distance_details["route_pattern_name"]
        stop_stations[from_stop_id] = distance_details["from_station_id"]

        # set this just in case the to station is a terminus
        stop_routes[to_stop_id] = distance_details["route_pattern_name"]
        stop_stations[to_stop_id] = distance_details["to_station_id"]

        stop_directions[to_stop_id] = distance_details["direction_id"]
        stop_directions[from_stop_id] = distance_details["direction_id"]

        from_station_lines = station_lines.get(from_station_id, set())
        to_station_lines = station_lines.get(to_station_id, set())
        transformed_line = transform_to_line(distance_details["route_id"])
        from_station_lines.add(transformed_line)
        to_station_lines.add(transformed_line)

        station_lines[from_station_id] = from_station_lines
        station_lines[to_station_id] = to_station_lines

    return stop_distances, station_lines, stop_routes, stop_directions, stop_stations


# there is probably still a more efficient way to do this.
def enrich_distances(target_stop_id, stop_distances, station_distances, stop_stations, stop_directions, stop_routes):
    stop_stack = []

    # assume each stop starts with one destination
    first_dest, first_dist = next(iter(stop_distances[target_stop_id].items()))
    stop_stack.append((first_dest, first_dist))

    current_stop_distances = {}

    target_station = stop_stations[target_stop_id]
    target_station_distances = station_distances.get(target_station, dict())

    while len(stop_stack) > 0:
        dest, dist = stop_stack.pop()
        destination_station = stop_stations[dest]

        current_stop_distances[dest] = dist
        target_station_distances[destination_station] = dist

        # distance is a symmetric relationship, so set the distance here for those routes that have a direction id change
        destination_station_distances = station_distances.get(destination_station, dict())
        destination_station_distances[target_station] = dist

        # This should be a terminus
        if dest not in stop_distances or stop_distances[dest] is None or len(stop_distances[dest]) == 0:
            break

        for child, child_distance in stop_distances[dest].items():
            # if the stops or in the same direction OR on the same route, keep traversing
            if stop_directions[child] == stop_directions[dest] or stop_routes[child] == stop_routes[dest]:
                stop_stack.append((child, dist + child_distance))

    station_distances[target_station] = target_station_distances

    return current_stop_distances, station_distances


# perform a dfs of the station graph starting from station_id filtered by line
# this will fully connect station_id to all stations on lines
# shared with station id
def connect_stations_graph(station_id, station_distances, station_lines):
    stk = []
    seen_stations = set()
    seen_stations.add(station_id)

    for dest, dist in station_distances[station_id].items():
        stk.append((dest, dist))

    while len(stk) > 0:
        dest, dist = stk.pop()

        print(f"Traversing from {station_id} to {dest}. Distance: {dist}")

        seen_stations.add(dest)

        station_distances[station_id][dest] = dist

        if dest not in station_distances:
            continue

        for second_dest, second_dist in station_distances[dest].items():

            # the station we're going to is unseen and is on one of the lines we started on
            # this should help to avoid inter-line cycles
            common_lines = station_lines[second_dest].intersection(station_lines[station_id])
            if second_dest not in seen_stations and len(common_lines) > 0 and second_dest not in station_distances[station_id]:
                stk.append((second_dest, second_dist + dist))


def ingest_station_distances():
    # station id => distance to other reachable stations on all routes
    stop_distances, station_lines, stop_routes, stop_directions, stop_stations = initialize_interstop_data()

    station_distances: WeightedGraph = {}
    # first pass on stops, just to initialliy the stations graph
    for stop_id in stop_distances:
        stop_distances[stop_id], station_distances = enrich_distances(
            stop_id, stop_distances, station_distances, stop_stations, stop_directions, stop_routes
        )

    # second pass to fully connect the stations graph
    for station_id in station_distances:
        connect_stations_graph(station_id, station_distances, station_lines)

    return station_distances


if __name__ == "__main__":
    station_distances = ingest_station_distances()
    with open("common/constants/station_distances.json", "w") as f:
        json.dump(station_distances, f, indent=2)
