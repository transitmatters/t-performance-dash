import json
import os
import requests
import boto3
import botocore

MBTA_V3_API_KEY = os.environ.get("MBTA_V3_API_KEY", "")
BUCKET = "tm-mbta-performance"

ROUTES_CR = [
    "CR-Fairmount",
    "CR-Fitchburg",
    "CR-Worcester",
    "CR-Franklin",
    "CR-Greenbush",
    "CR-Haverhill",
    "CR-Kingston",
    "CR-Lowell",
    "CR-Middleborough",
    "CR-Needham",
    "CR-Newburyport",
    "CR-Providence",
]


def get_line_stops():
    s3 = boto3.client("s3", config=botocore.client.Config(max_pool_connections=15))

    objects = s3.list_objects_v2(Bucket=BUCKET, Prefix="Events-live/daily-cr-data/{}".format(LINE_KEY))

    stop_names = set()

    for obj in objects["Contents"]:
        stop_names.add(obj["Key"].split("/")[2])

    stop_ids = []

    stop_prefix_len = len(LINE_KEY) + 3
    for stop in stop_names:
        stop_ids.append({"id": stop[stop_prefix_len:], "name": stop})

    parent_children_map = {}

    for stop in stop_ids:
        _, direction, stop_id = parse_stop_name(stop["name"])

        r_f = requests.get(
            "https://api-v3.mbta.com/stops/{}?include=parent_station&api_key={}".format(stop_id, MBTA_V3_API_KEY)
        )
        stop_details = r_f.json()

        parent_id = stop_details["data"]["relationships"]["parent_station"]["data"]["id"]

        if parent_id not in parent_children_map:
            if direction == "0":
                parent_children_map[parent_id] = {"0": [stop["name"]], "1": []}
            else:
                parent_children_map[parent_id] = {"0": [], "1": [stop["name"]]}
        else:
            parent_children_map[parent_id][direction].append(stop["name"])

    return parent_children_map


def parse_stop_name(stop_name: str):
    """
    Parse a CR stop id into its components
    """
    line, direction, stop_id = stop_name.split("_")
    return line, direction, stop_id


for LINE_KEY in ROUTES_CR:
    r_f = requests.get("https://api-v3.mbta.com/stops?filter%5Broute%5D={}".format(LINE_KEY))
    stops = r_f.json()

    stop_layout = get_line_stops()

    stops_formatted = []

    for index, stop in enumerate(stops["data"]):
        try:
            stops_formatted.append(
                {
                    "stop_name": stop["attributes"]["name"],
                    "station": stop["id"],
                    "branches": None,
                    "order": index + 1,
                    "stops": stop_layout[stop["id"]],
                }
            )
        except KeyError:
            c_f = requests.get(
                "https://api-v3.mbta.com/stops/{}?include=child_stops&api_key={}".format(stop["id"], MBTA_V3_API_KEY)
            )
            stop_details = c_f.json()

            child_stops = [
                child_stop["id"] for child_stop in stop_details["data"]["relationships"]["child_stops"]["data"]
            ]
            stops_map = {
                "0": [f"{LINE_KEY}_0_{stop}" for stop in child_stops],
                "1": [f"{LINE_KEY}_1_{stop}" for stop in child_stops],
            }

            stops_formatted.append(
                {
                    "stop_name": stop["attributes"]["name"],
                    "station": stop["id"],
                    "branches": None,
                    "order": index + 1,
                    "stops": stops_map,
                }
            )

    output = {
        LINE_KEY: {
            "type": "commuter-rail",
            "direction": {"0": "outbound", "1": "inbound"},
            "stations": stops_formatted,
        }
    }

    out_json = json.dumps(output, indent=2)
    with open("../common/constants/cr_constants/{}.json".format(LINE_KEY.lower()), "w") as f:
        f.write(out_json)
