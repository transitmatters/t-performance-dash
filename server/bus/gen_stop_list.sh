#!/bin/bash

for route in 1 4 7 8 9 10 11 14 15 16 18 21 22 23 26 28 29 30 31 32 34 35 36 37 38 39 41 42 43 44 45 47 51 55 57 66 69 71 73 77 80 83 85 86 87 88 89 90 91 92 93 94 95 96 97 99 111; do
    for f in $(find data/input/2024/ -name *.csv); do
        month=$(echo $f | cut -d/ -f4 | cut -d. -f1)
        poetry run python stop_list.py $f --checkpoints "data/input/MBTA_GTFS/checkpoints.txt" -r $route
        break 1
    done
done
