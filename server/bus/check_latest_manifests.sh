#!/bin/sh

newfile=$1

for i in 1 111 15  22  23  28  32  39  57  66  71  73  77; do
  mkdir -p data/output/manifests/
  pipenv run python manifest.py $newfile data/output/manifests/$i.json --checkpoints data/input/MBTA_GTFS/checkpoints.txt -r $i
  echo "Comparing old and new manifests for route $i"
  pipenv run python compare_manifest.py ../../src/bus_constants/$i.json data/output/manifests/$i.json
done
