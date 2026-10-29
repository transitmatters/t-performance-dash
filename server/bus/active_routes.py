"""List the dashboard's current bus manifests for the shell scripts in this folder.

Prints one line per manifest without a service_end: "<file stem>|<manifest key>|<member routes, space separated>",
e.g. "114-116-117|114/116/117|114 116 117". Member routes come from the manifest's stop IDs.
"""

import json
import pathlib

BUS_CONSTANTS = pathlib.Path(__file__).resolve().parents[2] / "common" / "constants" / "bus_constants"


def active_manifests():
    for path in sorted(BUS_CONSTANTS.glob("*.json")):
        manifest = json.loads(path.read_text())
        for key, route in manifest.items():
            if route.get("service_end"):
                continue
            routes = {
                stop.split("-")[0]
                for station in route["stations"]
                for stops in station["stops"].values()
                for stop in stops
            }
            yield path.stem, key, sorted(routes)


if __name__ == "__main__":
    for stem, key, routes in active_manifests():
        print(f"{stem}|{key}|{' '.join(routes)}")
