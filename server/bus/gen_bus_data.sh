#!/bin/bash -x

routes="$@"
if [ -z "$routes" ]; then
	routes="1 4 7 8 9 10 11 14 15 16 17 18 19 21 22 23 26 28 29 30 31 32 34 35 36 37 38 39 41 42 43 44 45 47 51 55 57 61 66 69 70 71 73 77 80 83 85 86 87 88 89 90 91 92 93 94 95 96 97 99 104 109 111 114 116 117 170 220 221 222"
fi

for y in `seq 2018 2024`; do
    for f in $(find data/input/$y/ -name '*.csv'); do
	echo "Generating stop data from $f"
        poetry run python bus2train.py $f data/output -r $routes
    done
done
