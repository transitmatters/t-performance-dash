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
        chks = pd.read_csv(checkpoint_file, index_col="checkpoint_id", squeeze=True)
        chks.index = chks.index.str.lower()
        return chks.str.replace("(Bus)", "", regex=False).str.strip()
    else:
        return {}


def emit_stop_obj(entry, branches = False):
    tpt_id = entry.name
    if entry['counts'].sum() < 100:
        # this timepoint is very infrequently used
        return None
    
    return {
        "stop_name": entry.stop_name.iloc[0],
        "branches": sorted(entry.route_id.unique().tolist()) if branches else None,
        "station": tpt_id,
        "order": int(entry.order_guess.iloc[0]),
        "stops": {
            "1": sorted(entry.loc[entry.direction_id == 1].full_stop_id.tolist()),
            "0": sorted(entry.loc[entry.direction_id == 0].full_stop_id.tolist()),
        }
    }


def create_manifest(df, routes, checkpoint_file):
    output_route_name = '/'.join(routes)

    df['time_point_id'] = df['time_point_id'].str.lower()
    df['time_point_order'] = df['time_point_order'].fillna(0)
    
    tpts = df[['route_id', 'stop_id', 'time_point_id', 'direction_id']].value_counts(dropna=False).rename("counts").reset_index()

    # use checkpoint file to map time_point_id to stop_name
    station_names = load_checkpoints(checkpoint_file)
    tpts['stop_name'] = tpts['time_point_id'].map(station_names)

    # Create full stop id e.g. '66-0-64000'
    tpts['full_stop_id'] = tpts[['route_id', 'direction_id', 'stop_id']].astype(str).agg('-'.join, axis=1)
    
    # Must be arranged by inbound direction. Use most common (mode) as guess (w/ max in case 2 modes)
    orders = df.loc[df.direction_id == 1].groupby("time_point_id", dropna=False)['time_point_order'].agg(lambda x: x.mode().max())
    tpts['order_guess'] = tpts['time_point_id'].map(orders).fillna(0).astype(int)

    stop_objs = tpts.groupby('time_point_id', dropna=False).apply(
            lambda x: emit_stop_obj(x, len(routes) > 1)
        ).dropna()

    manifest = {
        output_route_name: {
            "type": "bus",
            "direction": {
                "0": "outbound",
                "1": "inbound"
            },
            "stations": sorted(stop_objs.values, key=lambda x: x['order'])
        }
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

    manifest = create_manifest(data, routes, checkpoint_file)

    with open(output_file, "w", encoding="utf-8") as fd:
        json.dump(manifest, fd, ensure_ascii=False, indent=4)
        fd.write("\n")


if __name__ == "__main__":
    main()
