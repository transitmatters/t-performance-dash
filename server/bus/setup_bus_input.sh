#!/bin/sh -x

mkdir -p data/input

wget -O data/input/2021.zip https://www.arcgis.com/sharing/rest/content/items/2d415555f63b431597721151a7e07a3e/data
wget -O data/input/2020.zip https://www.arcgis.com/sharing/rest/content/items/4c1293151c6c4a069d49e6b85ee68ea4/data
wget -O data/input/2019.zip https://www.arcgis.com/sharing/rest/content/items/1bd340b39942438685d8dcdfe3f26d1a/data
wget -O data/input/2018.zip https://www.arcgis.com/sharing/rest/content/items/d685ba39d9a54d908f49a2a762a9eb47/data

wget -O data/input/gtfs.zip https://cdn.mbta.com/MBTA_GTFS.zip
unzip -d data/input/MBTA_GTFS/ data/input/gtfs.zip 

cd data/input
for i in 2021 2020 2019 2018; do
  unzip -d $i $i.zip
done

mv 2021/MBTA*/*.csv 2021/
rmdir 2021/MBTA_Bus_Arrival_Departure_Times_2021/

# Rename files so they have consistent names and no spaces.
mv "2020/Bus Arrival Departure Times Jan-Mar 2020.csv" "2020/2020-Q1.csv"
mv "2020/Bus Arrival Departure Times Apr-June 2020.csv" "2020/2020-Q2.csv"
mv "2020/Bus Arrival Departure Times Jul-Sep 2020.csv" "2020/2020-Q3.csv"
mv "2020/Bus Arrival Departure Times Oct-Dec 2020.csv" "2020/2020-Q4.csv"
mv "2019/MBTA Bus Arrival Departure Jan-Mar 2019.csv" "2019/2019-Q1.csv"
mv "2019/MBTA Bus Arrival Departure Apr-June 2019.csv" "2019/2019-Q2.csv"
mv "2019/MBTA Bus Arrival Departure Jul-Sept 2019.csv" "2019/2019-Q3.csv"
mv "2019/MBTA Bus Arrival Departure Oct-Dec 2019.csv" "2019/2019-Q4.csv"
mv "2018/MBTA Bus Arrival Departure Aug-Sept 2018.csv" "2018/2018-Q3.csv"
mv "2018/MBTA Bus Arrival Departure Oct-Dec 2018.csv" "2018/2018-Q4.csv"
sed -i -e 's/<U+FEFF>//' 2020/2020-Q3.csv

