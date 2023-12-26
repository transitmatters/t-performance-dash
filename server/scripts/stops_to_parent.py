import json
import os
import requests
import boto3
import botocore

MBTA_V3_API_KEY = os.environ.get("MBTA_V3_API_KEY", "")

LINE_KEY = "CR-Fitchburg"

BUCKET = "tm-mbta-performance"
s3 = boto3.client("s3", config=botocore.client.Config(max_pool_connections=15))

objects = s3.list_objects_v2(Bucket=BUCKET, Prefix="Events-live/daily-cr-data/{}".format(LINE_KEY))

stop_names = set()

for obj in objects["Contents"]:
    stop_names.add(obj["Key"].split("/")[2])

stop_ids = []

for stop in stop_names:
    stop_ids.append({"id": stop[15:], "name": stop})

parent_children_map = {}

for stop in stop_ids:
    try:
        r_f = requests.get(
            "https://api-v3.mbta.com/stops/{}?include=parent_station&api_key={}".format(stop["id"], MBTA_V3_API_KEY)
        )
        stop_details = r_f.json()

        parent_id = stop_details["data"]["relationships"]["parent_station"]["data"]["id"]

        if parent_id not in parent_children_map:
            parent_children_map[parent_id] = [stop["name"]]
        else:
            parent_children_map[parent_id].append(stop["name"])
    except:
        print("Error with stop: {}".format(stop["name"]))

print(parent_children_map)

out_json = json.dumps(parent_children_map, indent=2)
with open("./mapping.json", "w") as f:
    f.write(out_json)
