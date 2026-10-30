#!/bin/sh

# Regenerate every current dashboard manifest and diff it against the committed one.
# Usage: check_latest_manifests.sh <arrival/departure CSV>   or   check_latest_manifests.sh <YYYY-MM-DD> (GTFS schedule)

case "$1" in
  ????-??-??) input=""; source_args="--gtfs-date $1" ;;
  *) input="$1"; source_args="--checkpoints ./data/input/MBTA_GTFS/checkpoints.txt" ;;
esac

mkdir -p data/output/manifests/

uv run python active_routes.py | while IFS='|' read -r stem key routes; do
  uv run python manifest.py $input ./data/output/manifests/$stem.json $source_args -r $routes --name "$key"
  echo "Comparing old and new manifests for $key"
  uv run python compare_manifest.py ../../common/constants/bus_constants/$stem.json data/output/manifests/$stem.json
done
