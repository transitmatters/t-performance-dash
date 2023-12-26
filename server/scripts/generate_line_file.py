import json
import os
import requests
import boto3
import botocore

MBTA_V3_API_KEY = os.environ.get("MBTA_V3_API_KEY", "")

LINE_KEY = "CR-Providence"
BUCKET = "tm-mbta-performance"


def get_line_stops():
    s3 = boto3.client("s3", config=botocore.client.Config(max_pool_connections=15))

    objects = s3.list_objects_v2(Bucket=BUCKET, Prefix="Events-live/daily-cr-data/{}".format(LINE_KEY))

    stop_names = set()

    for obj in objects["Contents"]:
        stop_names.add(obj["Key"].split("/")[2])

    stop_ids = []

    for stop in stop_names:
        stop_ids.append({"id": stop[(len(LINE_KEY) + 3) :], "name": stop})

    parent_children_map = {}

    for stop in stop_ids:
        try:
            r_f = requests.get(
                "https://api-v3.mbta.com/stops/{}?include=parent_station&api_key={}".format(stop["id"], MBTA_V3_API_KEY)
            )
            stop_details = r_f.json()

            parent_id = stop_details["data"]["relationships"]["parent_station"]["data"]["id"]

            if parent_id not in parent_children_map:
                if is_inbound_or_outbound(stop["name"]) == "0":
                    parent_children_map[parent_id] = {"0": [stop["name"]], "1": []}
                else:
                    parent_children_map[parent_id] = {"0": [], "1": [stop["name"]]}
            else:
                parent_children_map[parent_id][is_inbound_or_outbound(stop["name"])].append(stop["name"])
        except:
            print("Error with stop: {}".format(stop["name"]))

    return parent_children_map


def is_inbound_or_outbound(stop_id: str):
    if "_0_" in stop_id:
        return "0"
    elif "_1_" in stop_id:
        return "1"


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
