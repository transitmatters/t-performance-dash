import argparse
import json
import pandas as pd

from bus2train import load_data


def load_checkpoints(checkpoint_file):
    """
    input: path to checkpoints.txt from GTFS
    output: dict(checkpoint_id -> station_name) or {}
    """
    if checkpoint_file:
        chks = pd.read_csv(checkpoint_file, index_col="checkpoint_id").squeeze("columns")
        chks.index = chks.index.str.lower()
        return chks.str.replace("(Bus)", "", regex=False).str.strip()
    else:
        return {}


def get_stop_ids(df, checkpoint_file):
    df["time_point_id"] = df["time_point_id"].str.lower()
    df["time_point_order"] = df["time_point_order"].fillna(0)

    tpts = (
        df[["route_id", "stop_id", "time_point_id", "direction_id"]]
        .value_counts(dropna=False)
        .rename("counts")
        .reset_index()
    )

    # use checkpoint file to map time_point_id to stop_name
    station_names = load_checkpoints(checkpoint_file)
    tpts["stop_name"] = tpts["time_point_id"].map(station_names)

    return tpts


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument("input", metavar="INPUT_CSV")
    parser.add_argument("--routes", "-r", nargs="+", type=str)
    parser.add_argument("--checkpoints", metavar="gtfs_checkpoints.txt")

    args = parser.parse_args()
    input_csv = args.input
    routes = args.routes
    checkpoint_file = args.checkpoints

    data = load_data(input_csv, routes)
    stop_ids = get_stop_ids(data, checkpoint_file)

    print(routes[0])
    json_formatted_str = json.dumps(list(set(stop_ids["stop_id"].sort_values().tolist())), indent=2)
    print(json_formatted_str)


if __name__ == "__main__":
    main()
