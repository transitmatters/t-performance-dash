#!/bin/bash

for f in $(find data/input/MBTA_Bus_Arrival_Departure_Times_2021/ -name *.csv); do
    pipenv run python bus2train.py $f data/actual -r 111 # 23 # 57 # 1 28 66 114 116 117
done
