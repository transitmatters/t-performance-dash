#!/bin/sh -x

newfile=$1

for i in 1 22 23 28 57; do
  mkdir -p data/output/manifests/
  pipenv run python manifest.py $newfile data/output/manifests/$i.json --checkpoints data/input/MBTA_GTFS/checkpoints.txt -r $i
  pipenv run python compare_manifest.py ../../src/bus_contstants/$i.json data/output/manifests/$i.json
done
