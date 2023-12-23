import json
import requests


r_f = requests.get("https://api-v3.mbta.com/stops?filter%5Broute%5D=CR-Franklin")
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

output = {
    "CR-Franklin": {
        "type": "commuter-rail",
        "direction": {"0": "outbound", "1": "inbound"},
        "stations": stops_formatted,
    }
}


out_json = json.dumps(output, indent=2)
with open("../common/constants/cr_constants/cr-franklin.json", "w") as f:
    f.write(out_json)
