#!/bin/sh

newfile=$1

for i in 1 4 7 8 9 10 11 14 15 16 18 21 22 23 26 28 29 30 31 32 34 35 36 37 38 39 41 42 43 44 45 47 51 55 57 66 69 71 73 77 80 83 85 86 87 88 89 90 91 92 93 94 95 96 97 99 100 101 105 106 108 110 111 112 119 134 215 230 236 238 240 354 429 455; do
  mkdir -p data/output/manifests/
  poetry run python manifest.py $newfile ./data/output/manifests/$i.json --checkpoints ./data/input/MBTA_GTFS/checkpoints.txt -r $i
  echo "Comparing old and new manifests for route $i"
  poetry run python compare_manifest.py ../../common/constants/bus_constants/$i.json data/output/manifests/$i.json
done


# Handle 17-19 separately
poetry run python manifest.py $newfile data/output/manifests/17-19.json --checkpoints data/input/MBTA_GTFS/checkpoints.txt -r 17 19
echo "Comparing old and new manifests for routes 17-19"
poetry run python compare_manifest.py ../../common/constants/bus_constants/17-19.json data/output/manifests/17-19.json


# Handle 61-70-170 separately
poetry run python manifest.py $newfile data/output/manifests/61-70-170.json --checkpoints data/input/MBTA_GTFS/checkpoints.txt -r 61 70 170
echo "Comparing old and new manifests for routes 61-70-170"
poetry run python compare_manifest.py ../../common/constants/bus_constants/61-70-170.json data/output/manifests/61-70-170.json


# Handle 104-109 separately
poetry run python manifest.py $newfile data/output/manifests/104-109.json --checkpoints data/input/MBTA_GTFS/checkpoints.txt -r 104 109
echo "Comparing old and new manifests for routes 104-109"
poetry run python compare_manifest.py ../../common/constants/bus_constants/104-109.json data/output/manifests/104-109.json


# Handle 114-116-117 separately
poetry run python manifest.py $newfile data/output/manifests/114-116-117.json --checkpoints data/input/MBTA_GTFS/checkpoints.txt -r 114 116 117
echo "Comparing old and new manifests for routes 114-116-117"
poetry run python compare_manifest.py ../../common/constants/bus_constants/114-116-117.json data/output/manifests/114-116-117.json


# Handle 220-221-222 separately
poetry run python manifest.py $newfile data/output/manifests/220-221-222.json --checkpoints data/input/MBTA_GTFS/checkpoints.txt -r 220 221 222
echo "Comparing old and new manifests for routes 220-221-222"
poetry run python compare_manifest.py ../../common/constants/bus_constants/220-221-222.json data/output/manifests/220-221-222.json
