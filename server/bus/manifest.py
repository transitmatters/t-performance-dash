"""Generate bus route manifest JSON files from GTFS checkpoint data."""

import argparse
import datetime
import pandas as pd
import json

from bus2train import load_data

CSV_MIN_COUNT = 100
GTFS_MIN_COUNT = 5
# In GTFS mode, also drop checkpoints on fewer than this share of the busiest checkpoint's trips (e.g. school trips)
GTFS_MIN_SHARE = 0.02


def order_checkpoints(stop_times):
    """
    Order checkpoints along the inbound direction so that branches and short-turn variants interleave
    correctly: topologically sort the "A comes before B" pairs from every inbound trip, breaking ties
    (and loops) by each checkpoint's most common position within its trip.
    """
    inbound = stop_times[stop_times.direction_id == 1].sort_values(["trip_id", "stop_sequence"])
    rank = inbound.groupby("time_point_id")["trip_rank"].agg(lambda x: x.mode().max()).to_dict()

    successors = {tpt: set() for tpt in rank}
    for _, tpts in inbound.groupby("trip_id")["time_point_id"]:
        tpts = tpts.tolist()
        for a, b in zip(tpts, tpts[1:]):
            if a != b:
                successors[a].add(b)
    indegree = {tpt: 0 for tpt in rank}
    for nexts in successors.values():
        for b in nexts:
            indegree[b] += 1

    order = {}
    remaining = set(rank)
    while remaining:
        ready = [tpt for tpt in remaining if indegree[tpt] == 0] or list(remaining)
        tpt = min(ready, key=lambda t: (rank[t], t))
        order[tpt] = len(order) + 1
        remaining.remove(tpt)
        for b in successors[tpt]:
            indegree[b] -= 1
    return order


def load_gtfs_data(start_date, days, routes):
    """
    Build the same columns load_data() produces, from scheduled GTFS trips over `days` days starting at
    `start_date`. Only checkpoint stops are kept, which matches what the LAMP bus ingest stores.
    Each row is one scheduled stop, so counts are scheduled trips rather than observed events.
    """
    # gtfs_archive downloads the archive index on import, so only pay for it in GTFS mode
    from gtfs_archive import get_gtfs_archive, get_services, to_dateint

    dates = [start_date + datetime.timedelta(days=offset) for offset in range(days)]
    dates_by_archive = {}
    for date in dates:
        dates_by_archive.setdefault(get_gtfs_archive(to_dateint(date)), []).append(date)

    frames = []
    for archive_dir, archive_dates in dates_by_archive.items():
        trips = pd.read_csv(
            archive_dir / "trips.txt",
            usecols=["route_id", "service_id", "trip_id", "direction_id"],
            dtype={"route_id": str, "service_id": str, "trip_id": str},
        )
        trips = trips[trips.route_id.isin(routes)]
        # a trip that runs on several days of the window is counted once per day
        running = pd.concat([trips[trips.service_id.isin(get_services(date, archive_dir))] for date in archive_dates])

        stop_times = pd.read_csv(
            archive_dir / "stop_times.txt",
            usecols=["trip_id", "stop_id", "stop_sequence", "checkpoint_id"],
            dtype={"trip_id": str, "stop_id": str, "checkpoint_id": str},
        )
        stop_times = stop_times[stop_times.trip_id.isin(trips.trip_id) & stop_times.checkpoint_id.notna()]
        stop_times = stop_times.sort_values(["trip_id", "stop_sequence"])
        stop_times["trip_rank"] = stop_times.groupby("trip_id").cumcount() + 1

        frames.append(running.merge(stop_times, on="trip_id"))
        frames[-1]["checkpoints_file"] = str(archive_dir / "checkpoints.txt")

    df = pd.concat(frames).rename(columns={"checkpoint_id": "time_point_id"})
    df["time_point_id"] = df["time_point_id"].str.lower()
    df["time_point_order"] = df["time_point_id"].map(order_checkpoints(df))
    return df[["route_id", "stop_id", "time_point_id", "direction_id", "time_point_order", "checkpoints_file"]]


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


def emit_stop_obj(entry, branches=False, min_count=CSV_MIN_COUNT):
    tpt_id = entry.name
    if entry["counts"].sum() < min_count:
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
        },
    }


def create_manifest(
    df, routes, checkpoint_file, name=None, min_count=CSV_MIN_COUNT, service_start=None, service_end=None
):
    output_route_name = name or "/".join(routes)

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

    # Create full stop id e.g. "66-0-64000"
    tpts["full_stop_id"] = tpts[["route_id", "direction_id", "stop_id"]].astype(str).agg("-".join, axis=1)

    # Must be arranged by inbound direction. Use most common (mode) as guess (w/ max in case 2 modes)
    orders = (
        df.loc[df.direction_id == 1]
        .groupby("time_point_id", dropna=False)["time_point_order"]
        .agg(lambda x: x.mode().max())
    )
    tpts["order_guess"] = tpts["time_point_id"].map(orders).fillna(0).astype(int)

    stop_objs = (
        tpts.groupby("time_point_id", dropna=False)
        .apply(lambda x: emit_stop_obj(x, len(routes) > 1, min_count), include_groups=False)
        .dropna()
    )

    route = {"type": "bus", "direction": {"0": "outbound", "1": "inbound"}}
    if service_start:
        route["service_start"] = service_start
    if service_end:
        route["service_end"] = service_end
    route["stations"] = sorted(stop_objs.values, key=lambda x: x["order"])

    return {output_route_name: route}


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument("input", metavar="INPUT_CSV", nargs="?", help="Arrival/departure CSV; omit with --gtfs-date")
    parser.add_argument("output", metavar="OUTPUT_JSON")
    parser.add_argument("--routes", "-r", nargs="+", type=str, required=True)
    parser.add_argument("--checkpoints", metavar="gtfs_checkpoints.txt")
    parser.add_argument(
        "--gtfs-date",
        type=datetime.date.fromisoformat,
        help="Build from scheduled GTFS trips starting on this date (YYYY-MM-DD) instead of a CSV",
    )
    parser.add_argument("--days", type=int, default=7, help="Days of GTFS service to include (default 7)")
    parser.add_argument("--name", help="Manifest key, e.g. 34 for -r 34 34E (default: routes joined with /)")
    parser.add_argument("--min-count", type=int, help="Drop timepoints seen fewer times than this")
    parser.add_argument("--service-start", help="Write service_start (YYYY-MM-DD) into the manifest")
    parser.add_argument("--service-end", help="Write service_end (YYYY-MM-DD) into the manifest")

    args = parser.parse_args()
    routes = args.routes
    checkpoint_file = args.checkpoints

    if args.gtfs_date:
        data = load_gtfs_data(args.gtfs_date, args.days, routes)
        checkpoint_file = checkpoint_file or data.checkpoints_file.iloc[-1]
        busiest = data.groupby("time_point_id").size().max()
        min_count = args.min_count if args.min_count is not None else max(GTFS_MIN_COUNT, int(busiest * GTFS_MIN_SHARE))
    elif args.input:
        data = load_data(args.input, routes)
        min_count = args.min_count if args.min_count is not None else CSV_MIN_COUNT
    else:
        parser.error("either INPUT_CSV or --gtfs-date is required")

    manifest = create_manifest(
        data,
        routes,
        checkpoint_file,
        name=args.name,
        min_count=min_count,
        service_start=args.service_start,
        service_end=args.service_end,
    )

    with open(args.output, "w", encoding="utf-8") as fd:
        json.dump(manifest, fd, ensure_ascii=False, indent=4)
        fd.write("\n")


if __name__ == "__main__":
    main()
