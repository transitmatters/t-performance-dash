#!/bin/bash -x

for y in `seq 2016 2022`; do
    for f in $(find data/input/$y/ -name '*.csv'); do
        echo "Generating stop data from $f"
        poetry run python process_events.py $f data/output
    done
done
