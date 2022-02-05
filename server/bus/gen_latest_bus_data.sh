#!/bin/bash -x

newfile=$1

poetry run python bus2train.py $newfile data/output -r 1  15  22  23  28  32  39  57  66  71  73  77  111 114 116 117;
# sample upload command below. note that an aws cp --recursive will be faster.
# aws s3 sync --dryrun data/output/Events/ s3://tm-mbta-performance/Events/
