import json
import os
import requests

MBTA_V3_API_KEY = os.environ.get("MBTA_V3_API_KEY", "")

stop_names = [
    "CR-Fitchburg_0_BNT-0000",
    "CR-Fitchburg_0_BNT-0000-08",
    "CR-Fitchburg_0_FR-0034-01",
    "CR-Fitchburg_0_FR-0064-01",
    "CR-Fitchburg_0_FR-0074-01",
    "CR-Fitchburg_0_FR-0098-01",
    "CR-Fitchburg_0_FR-0115-01",
    "CR-Fitchburg_0_FR-0132-01",
    "CR-Fitchburg_0_FR-0167-01",
    "CR-Fitchburg_0_FR-0201-01",
    "CR-Fitchburg_0_FR-0219-01",
    "CR-Fitchburg_0_FR-0253-01",
    "CR-Fitchburg_0_FR-0301-01",
    "CR-Fitchburg_0_FR-0361-01",
    "CR-Fitchburg_0_FR-0394-01",
    "CR-Fitchburg_0_FR-0451-01",
    "CR-Fitchburg_0_FR-0494-CS",
    "CR-Fitchburg_1_FR-0034-02",
    "CR-Fitchburg_1_FR-0064-02",
    "CR-Fitchburg_1_FR-0074-02",
    "CR-Fitchburg_1_FR-0098-S",
    "CR-Fitchburg_1_FR-0115-02",
    "CR-Fitchburg_1_FR-0132-02",
    "CR-Fitchburg_1_FR-0167-02",
    "CR-Fitchburg_1_FR-0201-02",
    "CR-Fitchburg_1_FR-0219-02",
    "CR-Fitchburg_1_FR-0253-02",
    "CR-Fitchburg_1_FR-0301-02",
    "CR-Fitchburg_1_FR-0361-02",
    "CR-Fitchburg_1_FR-0394-02",
    "CR-Fitchburg_1_FR-0451-02",
    "CR-Fitchburg_1_FR-0494-CS",
    "CR-Fitchburg_1_FR-3338-CS",
]

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
