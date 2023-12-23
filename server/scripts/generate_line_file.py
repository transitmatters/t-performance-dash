import json
import requests


r_f = requests.get("https://api-v3.mbta.com/stops?filter%5Broute%5D=CR-Kingston&include=child_stops")
stops = r_f.json()

stops_formatted = [
    {
        "stop_name": stop["attributes"]["name"],
        "station": stop["id"],
        "branches": None,
        "order": index + 1,
        "stops": {0: [], 1: []},
    }
    for index, stop in enumerate(stops["data"])
]

for index, stop in enumerate(stops["data"]):
    for platform in stop["relationships"]["child_stops"]["data"]:
        if (
            platform["type"] == "stop"
            and "door-" not in platform["id"]
            and "node-" not in platform["id"]
            and not platform["id"].isnumeric()
        ):
            print('"{}",'.format(platform["id"]))

output = {
    "CR-Lowell": {
        "type": "commuter-rail",
        "direction": {"0": "outbound", "1": "inbound"},
        "stations": stops_formatted,
    }
}


out_json = json.dumps(output, indent=2)
# with open("../common/constants/cr_constants/cr-foxboro.json", "w") as f:
#     f.write(out_json)
