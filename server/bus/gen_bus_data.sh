#!/bin/bash

for y in 2018 2019 2020 2021; do
    for f in $(find data/input/$y/ -name '*.csv'); do
	echo "Generating stop data from $f"
        pipenv run python bus2train.py $f data/output -r 1
    done
done
