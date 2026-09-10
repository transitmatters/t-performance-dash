import os
import json


mapping_for_odd_cases = {
    "SL1": 741,
    "SL2": 742,
    "SL3": 743,
    "SL4": 751,
    "SL5": 749,
    "SLW": 746,
    "746_": 746,
    "CT2": 747,
    "CT3": 708,
}


def extract_branch_stops(route_data: dict, route_key: str) -> dict[str, set[str]]:
    """
    Given a single route data dict (like data["236"]) and its key,
    return {branch: set(stop_ids)}.
    """
    branch_stops: dict[str, set[str]] = {}

    for station in route_data.get("stations", []):
        branches = station.get("branches") or [route_key]
        for branch in branches:
            branch_stops.setdefault(branch, set())
            for dir_stops in station.get("stops", {}).values():
                branch_stops[branch].update(dir_stops)

    return branch_stops


def process_folder(folder_path: str) -> dict[str, dict[str, set[str]]]:
    """
    Process all JSON files in the folder.

    Returns:
      {
        "556/558": {
            "556": {stop_ids...},
            "558": {stop_ids...}
        },
        "236": {
            "236": {stop_ids...}
        }
      }
    """
    all_routes: dict[str, dict[str, set[str]]] = {}

    for filename in os.listdir(folder_path):
        if not filename.endswith(".json"):
            continue

        filepath = os.path.join(folder_path, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        for route_key, route_data in data.items():
            all_routes[route_key] = extract_branch_stops(route_data, route_key)

    return all_routes


# Sort with mixed alphanumeric support
def mixed_sort_key(x):
    route = list(x.keys())[0]
    import re

    # Split route into parts (letters and numbers)
    parts = re.findall(r"[A-Za-z]+|\d+", route.split("/")[0])

    # Convert to sortable format: (letters, numbers)
    sort_parts = []
    for part in parts:
        if part.isdigit():
            sort_parts.append((0, int(part)))  # Numbers first, as integers
        else:
            sort_parts.append((1, part.upper()))  # Letters second, uppercase

    return sort_parts


def split_route_num_2_stop_id(route_string: str) -> str:
    """Route id like "1-0-102" will return 102"""
    return route_string.split("-")[2]


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    folder = os.path.join(script_dir, "../../common/constants/bus_constants")
    results = process_folder(folder)

    # Format as dictionary with sets
    output_dict = {}
    staging_list = []
    for route_key, branches in results.items():
        for branch, stops in branches.items():
            # Convert each stop ID in the set
            stop_ids = {split_route_num_2_stop_id(stop) for stop in stops}
            # Lookup to replace CT2 with 747 and other such cases, defaults to original val
            final_branch = str(mapping_for_odd_cases.get(branch, branch))
            staging_list.append({final_branch: stop_ids})
    staging_list.sort(key=mixed_sort_key)

    for item in staging_list:
        output_dict.update(item)
    # Create data folder if it doesn't exist
    data_folder = os.path.join(script_dir, "data/output")
    os.makedirs(data_folder, exist_ok=True)

    # Write Python file
    output_file = os.path.join(data_folder, "bus_stop_ids_by_route.py")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("# Auto-generated file containing bus stop IDs by route\n\n")
        f.write(str(output_dict))

    print(f"Exported bus stop IDs to: {output_file}")
    print(f"Found {len(output_dict)} routes with stop data")
