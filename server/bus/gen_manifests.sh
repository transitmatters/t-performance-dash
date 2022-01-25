#!/bin/bash

for route in 1 111 15  22  23  28  32  39  57  66  71  73  77  114  116  117; do
    mkdir -p data/output/manifests/$route

    for f in $(find data/input/ -name *.csv); do
        month=$(echo $f | cut -d/ -f4 | cut -d. -f1)
        pipenv run python manifest.py $f "data/output/manifests/$route/$route_$month.json" --checkpoints "data/input/MBTA_GTFS/checkpoints.txt" -r $route
    done
done
