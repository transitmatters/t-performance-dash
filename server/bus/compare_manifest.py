import json
import sys

station_stops = {}


def runone(path, first=False):
    unchanged = True
    current = json.load(open(path))
    # Print any removed stops first
    if not first:
        my_stations = list(current.values())[0]['stations']
        stat_map = dict(map(lambda x: (x['station'], x), my_stations))
        for s in station_stops:
            if s not in stat_map:
                print("  - Station %s removed in file %s. (Stops: %s)" % (s, path, station_stops[s]))
                continue
            for d in station_stops[s]:
                for stop in station_stops[s][d]:
                    if stop not in stat_map[s]['stops'][d]:
                        print("  - Stop %s removed from %s in file %s" % (stop, s, path))

    for i in list(current.values())[0]['stations']:
        s = i['station']

        if s not in station_stops:
            station_stops[s] = {}
            if not first:
                print(" + Found new station %s" % s)
                unchanged = False
        for direction in i['stops']:
            if direction not in station_stops[s]:
                station_stops[s][direction] = []
            for stop in i['stops'][direction]:
                if stop not in station_stops[s][direction]:
                    station_stops[s][direction].append(stop)
                    if not first:
                        print("  + Found additional stop %s at station %s in %s" % (stop, s, path))
                        unchanged = False
    return unchanged


def run(paths):
    unchanged = True
    runone(paths[0], first=True)
    for path in reversed(paths[1:]):
        unchanged = runone(path) and unchanged
    if unchanged:
        print("No new stations/stops on route.")
    else:
        print("Changed?")


if __name__ == "__main__":
    run(sys.argv[1:])
