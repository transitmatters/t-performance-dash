import json
import sys

station_stops = {}

def runone(path, first=False):
    unchanged = True
    current = json.load(open(path))
    for i in list(current.values())[0]['stations']:
        s = i['station']
        
        if not s in station_stops: 
            station_stops[s] = {}
            if not first:
                print("Found missing station %s" % s)
                unchanged = False
        for direction in i['stops']:
            if not direction in station_stops[s]:
                station_stops[s][direction] = []
            for stop in i['stops'][direction]:
                if not stop in station_stops[s][direction]:
                    station_stops[s][direction].append(stop)
                    if not first:
                        print("Found additional stop %s at station %s in %s" % (stop, s, path))
                        unchanged = False
    return unchanged

def run(paths):
    unchanged = True
    runone(paths[0], first=True)
    for path in reversed(paths[1:]):
        unchanged = unchanged and runone(path)
    if unchanged == True:
        print("No new stations/stops on route.")
    else:
        print("Changed?")
    

if __name__ == "__main__":
    run(sys.argv[1:])
