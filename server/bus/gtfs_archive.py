import datetime
import pandas as pd
import pathlib
import shutil
import urllib.request

MAIN_DIR = pathlib.Path("./data/gtfs_archives/")
MAIN_DIR.mkdir(parents=True, exist_ok=True)

ARCHIVES = pd.read_csv("https://cdn.mbta.com/archive/archived_feeds.txt")


def to_dateint(date):
    """turn date into 20220615 e.g."""
    return int(str(date).replace("-", ""))


def get_gtfs_archive(dateint: int):
    """
    Determine which GTFS archive corresponds to the date.
    Returns that archive folder, downloading if it doesn't yet exist.
    """
    matches = ARCHIVES[(ARCHIVES.feed_start_date <= dateint) & (ARCHIVES.feed_end_date >= dateint)]
    archive_url = matches.iloc[0].archive_url

    archive_name = pathlib.Path(archive_url).stem

    if (MAIN_DIR / archive_name).exists():
        print(f"Archive for {dateint} already exists: {archive_name}")
        return MAIN_DIR / archive_name

    # else we have to download it
    print(f"Downloading archive for {dateint}: {archive_url}")
    zipfile, _ = urllib.request.urlretrieve(archive_url)
    shutil.unpack_archive(zipfile, extract_dir=(MAIN_DIR / archive_name), format="zip")
    # remove temporary zipfile
    urllib.request.urlcleanup()

    return MAIN_DIR / archive_name


def get_services(date: datetime.date, archive_dir: pathlib.Path):
    """
    Read calendar.txt to determine which services ran on the given date.
    Also, incorporate exceptions from calendar_dates.txt for holidays, etc.
    """
    dateint = to_dateint(date)
    day_of_week = date.strftime("%A").lower()

    cal = pd.read_csv(archive_dir / "calendar.txt")
    current_services = cal[(cal.start_date <= dateint) & (cal.end_date >= dateint)]
    services = current_services[current_services[day_of_week] == 1].service_id.tolist()

    exceptions = pd.read_csv(archive_dir / "calendar_dates.txt")
    exceptions = exceptions[exceptions.date == dateint]
    additions = exceptions[exceptions.exception_type == 1].service_id.tolist()
    subtractions = exceptions[exceptions.exception_type == 2].service_id.tolist()

    services = (set(services) - set(subtractions)) | set(additions)
    return list(services)


def read_gtfs(date: datetime.date):
    """
    Given a date, this function will:
    - Find the appropriate gtfs archive (downloading if necessary)
    - Determine which services ran on that date
    - Return two dataframes containing just the trips and stop_times that ran on that date
    """
    dateint = to_dateint(date)

    archive_dir = get_gtfs_archive(dateint)
    services = get_services(date, archive_dir)

    # specify dtypes to avoid warnings
    trips = pd.read_csv(archive_dir / "trips.txt", dtype={"trip_short_name": str})
    trips = trips[trips.service_id.isin(services)]

    stops = pd.read_csv(
        archive_dir / "stop_times.txt",
        dtype={"trip_id": str, "stop_id": str, "stop_headsign": str, "checkpoint_id": str},
    )
    stops = stops[stops.trip_id.isin(trips.trip_id)]
    stops.arrival_time = pd.to_timedelta(stops.arrival_time)
    stops.departure_time = pd.to_timedelta(stops.departure_time)

    return trips, stops


def add_gtfs_headways(events_df):
    """
    This will calculate scheduled headway and traveltime information
    from gtfs for the routes we care about, and then match our actual
    events to the scheduled values. This matching is done based on
    time-of-day, so is not an excact match. Luckily, pandas helps us out
    with merge_asof.
    https://pandas.pydata.org/docs/reference/api/pandas.merge_asof.html
    """
    # TODO: I think we need to worry about 114/116/117 headways?

    # defining these columns in particular becasue we use them everywhere
    RTE_DIR_STOP = ["route_id", "direction_id", "stop_id"]

    results = []

    # wa have to do this day-by-day because gtfs changes so often
    for service_date, days_events in events_df.groupby("service_date"):
        all_trips, all_stops = read_gtfs(service_date.date())

        # filter out the trips of interest
        relevant_trips = all_trips[all_trips.route_id.isin(days_events.route_id)]

        # take only the stops from those trips (adding route and dir info)
        trip_info = relevant_trips[["trip_id", "route_id", "direction_id"]]
        gtfs_stops = all_stops.merge(trip_info, on="trip_id", how="right")

        # calculate gtfs headways
        gtfs_stops = gtfs_stops.sort_values(by="arrival_time")
        headways = gtfs_stops.groupby(RTE_DIR_STOP).arrival_time.diff()
        gtfs_stops["scheduled_headway"] = headways.dt.seconds

        # calculate gtfs traveltimes
        trip_start_times = gtfs_stops.groupby("trip_id").arrival_time.transform("min")
        gtfs_stops["scheduled_tt"] = (gtfs_stops.arrival_time - trip_start_times).dt.seconds

        # assign each actual timepoint a scheduled headway
        # merge_asof 'backward' matches the previous scheduled value of 'arrival_time'
        days_events["arrival_time"] = days_events.event_time - service_date
        final = pd.merge_asof(
            days_events.sort_values(by="arrival_time"),
            gtfs_stops[RTE_DIR_STOP + ["arrival_time", "scheduled_headway"]],
            on="arrival_time",
            direction="backward",
            by=RTE_DIR_STOP,
        )

        # assign each actual trip a scheduled trip_id, based on when it started the route
        route_starts = days_events.loc[days_events.groupby("trip_id").event_time.idxmin()]
        route_starts = route_starts[RTE_DIR_STOP + ["trip_id", "arrival_time"]]

        trip_id_map = pd.merge_asof(
            route_starts.sort_values(by="arrival_time"),
            gtfs_stops[RTE_DIR_STOP + ["arrival_time", "trip_id"]],
            on="arrival_time",
            direction="nearest",
            by=RTE_DIR_STOP,
            suffixes=["", "_scheduled"],
        )
        trip_id_map = trip_id_map.set_index("trip_id").trip_id_scheduled

        # use the scheduled trip matching to get the scheduled traveltime
        final["scheduled_trip_id"] = final.trip_id.map(trip_id_map)
        final = pd.merge(
            final,
            gtfs_stops[RTE_DIR_STOP + ["trip_id", "scheduled_tt"]],
            how="left",
            left_on=RTE_DIR_STOP + ["scheduled_trip_id"],
            right_on=RTE_DIR_STOP + ["trip_id"],
            suffixes=["", "_gtfs"],
        )

        # finally, put all the days together
        results.append(final)

    return pd.concat(results)
