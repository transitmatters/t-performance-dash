#!/bin/bash -x

routes="$@"
if [ -z "$routes" ]; then
	routes="1 4 9 15 16 17 19 21 22 23 28 32 34 39 41 45 47 55 57 61 66 70 71 73 77 85 86 89 91 92 104 109 111 114 116 117 170 220 221 222"
fi

for y in `seq 2018 2023`; do
    for f in $(find data/input/$y/ -name '*.csv'); do
	echo "Generating stop data from $f"
        poetry run python bus2train.py $f data/output -r $routes
    done
done
