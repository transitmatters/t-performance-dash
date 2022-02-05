#!/bin/sh

newfile=$1

for i in 1  15  22  23  28  32  39  57  66  71  73  77  111; do
  mkdir -p data/output/manifests/
  poetry run python manifest.py $newfile data/output/manifests/$i.json --checkpoints data/input/MBTA_GTFS/checkpoints.txt -r $i
  echo "Comparing old and new manifests for route $i"
  poetry run python compare_manifest.py ../../src/bus_constants/$i.json data/output/manifests/$i.json
done

# Handle 114-116-117 separately
poetry run python manifest.py $newfile data/output/manifests/114-116-117.json --checkpoints data/input/MBTA_GTFS/checkpoints.txt -r 114 116 117
echo "Comparing old and new manifests for routes 114-116-117"
poetry run python compare_manifest.py ../../src/bus_constants/114-116-117.json data/output/manifests/114-116-117.json
