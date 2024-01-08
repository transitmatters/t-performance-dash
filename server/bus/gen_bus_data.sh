#!/bin/bash -x

routes="$@"
if [ -z "$routes" ]; then
	routes="1 9 15 16 22 23 28 32 39 57 66 71 73 77 111 114 116 117 220 221 222"
fi

for y in `seq 2018 2023`; do
    for f in $(find data/input/$y/ -name '*.csv'); do
	echo "Generating stop data from $f"
        poetry run python bus2train.py $f data/output -r $routes
    done
done
