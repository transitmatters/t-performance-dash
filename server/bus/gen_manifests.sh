#!/bin/bash

uv run python active_routes.py | while IFS='|' read -r stem key routes; do

    mkdir -p data/output/manifests/$stem

    for f in $(find data/input/ -name *.csv); do
        month=$(echo $f | cut -d/ -f4 | cut -d. -f1)
        uv run python manifest.py $f "data/output/manifests/$stem/${stem}_$month.json" --checkpoints "data/input/MBTA_GTFS/checkpoints.txt" -r $routes --name "$key"
    done
done
