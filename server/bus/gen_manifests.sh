#!/bin/bash

route="111"

mkdir data/output/manifests/$route

for f in $(find data/input/MBTA_Bus_Arrival_Departure_Times_2021/ -name *.csv); do
    month=$(echo $f | rev | cut -d- -f1 | rev | cut -d. -f1)
    pipenv run python manifest.py $f "data/output/manifests/$route/$route_$month.json" --checkpoints "data/MBTA_GTFS/checkpoints.txt" -r $route
done