#!/bin/bash -x

routes="$@"
if [ -z "$routes" ]; then
	routes="1"
fi

for y in 2018 2019 2020 2021; do
    for f in $(find data/input/$y/ -name '*.csv'); do
	echo "Generating stop data from $f"
        pipenv run python bus2train.py $f data/output -r $routes
    done
done
