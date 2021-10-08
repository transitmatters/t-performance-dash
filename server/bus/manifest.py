import argparse
import pandas as pd
import json

from bus2train import load_data


def load_checkpoints(checkpoint_file):
    """
    input: path to checkpoints.txt from GTFS
    output: dict(checkpoint_id -> station_name) or {}
    """
    if checkpoint_file:
        return pd.read_csv(checkpoint_file, index_col="checkpoint_id").to_dict()["checkpoint_name"]
    else:
        return {} 


def create_manifest(df, checkpoint_file):
    station_names = load_checkpoints(checkpoint_file)

    manifest = {}
    
    timepoints = df.groupby(['route_id', 'time_point_id', 'stop_id', 'direction_id'])['time_point_order'].agg(pd.Series.mode).reset_index()
    timepoints.stop_id = timepoints.stop_id.astype(str)

    for rte_id, points in timepoints.groupby('route_id'):
        summary = []
        for tp_id, info in points.groupby('time_point_id'):
            inbound = info.loc[info.direction_id == 1]
            outbound = info.loc[info.direction_id == 0]

            # This assumes a very linear route: any branches need to be added manually
            # In addition, stop_order should be double checked, since this is just a guess
            order_guess = inbound.time_point_order.max()
            if pd.isnull(order_guess):
                order_guess = 0
            else:
                order_guess = int(order_guess) # none of that icky int64 stuff, json-serializable please
            this_obj = {
                "stop_name": station_names.get(tp_id.lower(), ""),
                "branches": None,
                "station": tp_id.lower(),
                "order": order_guess,
                "stops": {
                    "1": [f"{rte_id}-1-{stop_id}" for stop_id in inbound.stop_id],
                    "0": [f"{rte_id}-0-{stop_id}" for stop_id in outbound.stop_id]
                }
            }
            summary.append(this_obj)

        manifest[rte_id] = {
            "type": "bus",
            "direction": {
                "0": "outbound",
                "1": "inbound"
            },
            "stations": sorted(summary, key = lambda x: x['order'])
        }

    return manifest

def main():
    parser = argparse.ArgumentParser()

    parser.add_argument('input', metavar='INPUT_CSV')
    parser.add_argument('output', metavar='OUTPUT_JSON')
    parser.add_argument('--routes', '-r', nargs="+", type=str)
    parser.add_argument('--checkpoints', metavar="gtfs_checkpoints.txt")

    args = parser.parse_args()
    input_csv = args.input
    output_file = args.output
    routes = args.routes
    checkpoint_file = args.checkpoints

    data = load_data(input_csv, routes)
    
    manifest = create_manifest(data, checkpoint_file)
    
    with open(output_file, "w", encoding="utf-8") as fd:
        json.dump(manifest, fd, ensure_ascii=False, indent=4)
        fd.write("\n")

if __name__ == "__main__":
    main()