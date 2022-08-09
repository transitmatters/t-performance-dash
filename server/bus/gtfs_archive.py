import datetime
import pandas as pd
import pathlib
import shutil
import urllib.request

MAIN_DIR = pathlib.Path("./data/gtfs_archives/")
MAIN_DIR.mkdir(parents=True, exist_ok=True)

archives = pd.read_csv("https://cdn.mbta.com/archive/archived_feeds.txt")

def to_datestr(date):
    return int(str(date).replace('-', ''))

def get_gtfs_archive(datestr: int):
    matches = archives[(archives.feed_start_date <= datestr) & (archives.feed_end_date >= datestr)]
    archive_url = matches.iloc[0].archive_url

    archive_name = pathlib.Path(archive_url).stem

    if (MAIN_DIR/archive_name).exists():
        print("archive already exists:", archive_name)
        return MAIN_DIR/archive_name

    print("downloading archive", archive_url)
    zipfile, _ = urllib.request.urlretrieve(archive_url)
    shutil.unpack_archive(zipfile, extract_dir=MAIN_DIR/archive_name, format='zip')
    print("archive inflated")

    urllib.request.urlcleanup() # remove temporary zipfile
    return MAIN_DIR/archive_name

def get_services(date: datetime.date, archive_dir: pathlib.Path):
    datestr = to_datestr(date)
    day_of_week = date.strftime("%A").lower()

    cal = pd.read_csv(archive_dir/"calendar.txt")
    current_services = cal[(cal.start_date <= datestr) & (cal.end_date >= datestr)]
    services = current_services[current_services[day_of_week] == 1].service_id.tolist()

    exceptions = pd.read_csv(archive_dir/"calendar_dates.txt")
    exceptions = exceptions[exceptions.date == datestr]
    additions = exceptions[exceptions.exception_type == 1].service_id.tolist()
    subtractions = exceptions[exceptions.exception_type == 2].service_id.tolist()

    services = (set(services) - set(subtractions)) | set(additions)
    return list(services)


def read_gtfs(date: datetime.date):
    datestr = to_datestr(date)
    
    archive_dir = get_gtfs_archive(datestr)
    services = get_services(date, archive_dir)

    trips = pd.read_csv(archive_dir/"trips.txt", dtype={'trip_short_name': str})
    trips = trips[trips.service_id.isin(services)]

    stops = pd.read_csv(archive_dir/"stop_times.txt",
                        dtype={'trip_id': str,
                               'stop_id': str,
                               'stop_headsign': str,
                               'checkpoint_id': str}
                        )
    stops = stops[stops.trip_id.isin(trips.trip_id.unique())]
    stops.arrival_time = pd.to_timedelta(stops.arrival_time)
    stops.departure_time = pd.to_timedelta(stops.departure_time)
    
    return trips, stops


def add_gtfs_headways(df):
    for service_date, group in df.groupby('service_date'):
        trips, stops = read_gtfs(service_date.date())

        for (rte, dir), group in group.groupby(['route_id', 'direction_id']):

            mytrips = trips[(trips.route_id == rte) & (trips.direction_id == dir)]
            mystops = stops[stops.trip_id.isin(mytrips.trip_id)].sort_values(by='arrival_time')
            mystops['headways'] = mystops.groupby('stop_id').arrival_time.diff()

            for stop_id, g in group.groupby("stop_id"):

                headways = mystops[mystops.stop_id == stop_id].set_index('arrival_time').headways.dt.seconds

                # get the closest headway to the actual event time
                idx = headways.index.get_indexer(g.event_time - service_date, method='ffill')
                # -1 means not found. we'll use index 0, which has NaN headway anyway
                idx[idx < 0] = 0

                # set the headways on the original df
                df.loc[g.index, 'scheduled_headway'] = headways[idx].values
    
    return df


