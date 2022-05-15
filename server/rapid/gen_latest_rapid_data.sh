#!/bin/bash -x

# step 1: download and inflate from the feed (see appropriate line in setup_rapid_input.sh)
# stop 2: run this script with the new files

newfile=$1

poetry run python process_events.py $newfile data/output

# step 3: upload to aws
# sample upload command below. note that an aws cp --recursive will be faster (if you only have one month).
# aws s3 sync --dryrun data/output/Events/ s3://tm-mbta-performance/Events/
# aws s3 cp --recursive --dryrun data/output/Events/ s3://tm-mbta-performance/Events/
