#!/bin/bash

for route in 1 4 7 8 9 10 11 14 15 16 17 18 19 21 22 23 26 28 29 30 31 32 34 35 36 37 38 39 41 42 43 44 45 47 51 55 57 61 66 69 70 71 73 77 80 83 85 86 87 88 89 90 91 92 93 94 95 96 97 99 100 101 104 105 108 109 110 111 112 114 116 117 119 134 170 215 220 221 222 230 236 238 240 354 429 455; do

    mkdir -p data/output/manifests/$route

    for f in $(find data/input/ -name *.csv); do
        month=$(echo $f | cut -d/ -f4 | cut -d. -f1)
        poetry run python manifest.py $f "data/output/manifests/$route/$route_$month.json" --checkpoints "data/input/MBTA_GTFS/checkpoints.txt" -r $route
    done
done
