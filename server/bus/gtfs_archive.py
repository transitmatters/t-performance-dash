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


def _old_add_gtfs_headways(df):
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

def add_gtfs_headways(df):
    # TODO: I think we need to worry about 114/116/117 headways?
    results = []

    # wa have to do this day-by-day because gtfs changes so often
    for service_date, day_group in df.groupby('service_date'):
        trips, stops = read_gtfs(service_date.date())

        # filter out the trips of interest
        mytrips = trips[trips.route_id.isin(day_group.route_id)]

        # take only the stops on those trips (adding route and dir info)
        trip_info = mytrips[['trip_id', 'route_id', 'direction_id']]
        mystops = stops.merge(trip_info, on='trip_id', how='right')

        # calculate gtfs headways
        mystops = mystops.sort_values(by='arrival_time')
        headways = mystops.groupby(['route_id', 'stop_id', 'direction_id']).arrival_time.diff()
        mystops['scheduled_headway'] = headways.dt.seconds

        # calculate gtfs traveltimes
        trip_start_time = mystops.groupby('trip_id').arrival_time.transform('min')
        mystops['scheduled_tt'] = (mystops.arrival_time - trip_start_time).dt.seconds


        # assign each actual timepoint a scheduled headway
        # merge_asof will match the previous scheduled value for 'arrival_time'
        day_group['arrival_time'] = day_group.event_time - service_date
        final = pd.merge_asof(day_group.sort_values(by='arrival_time'),
                              mystops[['route_id', 'stop_id', 'direction_id', 'arrival_time', 'scheduled_headway']],
                              on='arrival_time', direction='backward',
                              by=['route_id', 'stop_id', 'direction_id'])

        # assign each actual trip a scheduled trip_id, based on when it started the route
        route_starts = day_group.loc[day_group.groupby('trip_id').event_time.idxmin()]
        route_starts = route_starts[['trip_id','route_id','direction_id','stop_id','arrival_time']]

        trip_id_map = pd.merge_asof(route_starts.sort_values(by='arrival_time'),
                                    mystops[['trip_id','route_id','direction_id','stop_id','arrival_time']],
                                    on='arrival_time', direction='nearest',
                                    by=['route_id','direction_id','stop_id'],
                                    suffixes=['', '_scheduled'])
        trip_id_map = trip_id_map.set_index('trip_id').trip_id_scheduled
        
        # use the scheduled trip matching to get the scheduled traveltime
        final['scheduled_trip_id'] = final.trip_id.map(trip_id_map)
        final = final.merge(mystops[['trip_id','route_id','direction_id','stop_id','scheduled_tt']],
                            how='left', 
                            left_on=['scheduled_trip_id','route_id','direction_id','stop_id'],
                            right_on=['trip_id','route_id','direction_id','stop_id'],
                            suffixes=['', '_gtfs'])


        # finally, put all the days together
        results.append(final)

    return pd.concat(results)
