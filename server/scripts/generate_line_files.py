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

    stop_ids = set()

    for obj in objects["Contents"]:
        stop_ids.add(parse_s3_cr_uri(obj)[2])

    parent_children_map = {}

    for stop in stop_ids:
        r_f = requests.get(
            "https://api-v3.mbta.com/stops/{}?include=parent_station&api_key={}".format(stop["id"], MBTA_V3_API_KEY)
        )
        stop_details = r_f.json()

        parent_id = stop_details["data"]["relationships"]["parent_station"]["data"]["id"]

        if parent_id not in parent_children_map:
            if stop["direction"] == "0":
                parent_children_map[parent_id] = {"0": [stop["stop_id"]], "1": []}
            else:
                parent_children_map[parent_id] = {"0": [], "1": [stop["stop_id"]]}
        else:
            parent_children_map[parent_id][stop["direction"]].append(stop["stop_id"])

    return parent_children_map


def parse_s3_cr_uri(uri: str):
    """
    Parse a CR s3 URI beginning with Events-live
    """
    _, _, stop_name, year, month, day, _ = uri["Key"].split("/")
    line, direction, stop_id = stop_name.split("_")
    return {"line": line, "direction": direction, "stop_id": stop_id, "year": year, "month": month, "day": day}


def cr_stop_info_to_s3_prefix(line, direction, stop_id):
    return "{}_{}_{}".format(line, direction, stop_id)


for LINE_KEY in ROUTES_CR:
    r_f = requests.get("https://api-v3.mbta.com/stops?filter%5Broute%5D={}".format(LINE_KEY))
    stops = r_f.json()

    stop_layout = get_line_stops()

    stops_formatted = [
        {
            "stop_name": stop["attributes"]["name"],
            "station": stop["id"],
            "branches": None,
            "order": index + 1,
            "stops": stop_layout[stop["id"]],
        }
        for index, stop in enumerate(stops["data"])
    ]

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
