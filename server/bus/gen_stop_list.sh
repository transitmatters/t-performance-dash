#!/bin/bash

for route in 29 30 31 35 36 37 38; do
    for f in $(find data/input/2024/ -name *.csv); do
        month=$(echo $f | cut -d/ -f4 | cut -d. -f1)
        poetry run python stop_list.py $f --checkpoints "data/input/MBTA_GTFS/checkpoints.txt" -r $route
        break 1
    done
done
