#!/bin/bash

year=${1:-2025}

for route in $(uv run python active_routes.py | cut -d'|' -f3 | tr ' ' '\n' | sort -u); do
    for f in $(find data/input/$year/ -name *.csv); do
        uv run python stop_list.py $f --checkpoints "data/input/MBTA_GTFS/checkpoints.txt" -r $route
        break 1
    done
done
