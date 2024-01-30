#!/bin/sh -x

mkdir -p data/input

# 2016 is a weird case- seems to be tts, headways, etc. not ARR DEP events.
wget -N -O data/input/2016.zip https://www.arcgis.com/sharing/rest/content/items/3e892be850fe4cc4a15d6450de4bd318/data
wget -N -O data/input/2017.zip https://www.arcgis.com/sharing/rest/content/items/cde60045db904ad299922f4f8759dcad/data
wget -N -O data/input/2018.zip https://www.arcgis.com/sharing/rest/content/items/25c3086e9826407e9f59dd9844f6c975/data
wget -N -O data/input/2019.zip https://www.arcgis.com/sharing/rest/content/items/11bbb87f8fb245c2b87ed3c8a099b95f/data
wget -N -O data/input/2020.zip https://www.arcgis.com/sharing/rest/content/items/cb4cf52bafb1402b9b978a424ed4dd78/data
wget -N -O data/input/2021.zip https://www.arcgis.com/sharing/rest/content/items/611b8c77f30245a0af0c62e2859e8b49/data
wget -N -O data/input/2022.zip https://www.arcgis.com/sharing/rest/content/items/99094a0c59e443cdbdaefa071c6df609/data
wget -N -O data/input/2023.zip https://www.arcgis.com/sharing/rest/content/items/9a7f5634db72459ab731b6a9b274a1d4/data

cd data/input
for i in `seq 2017 2023`; do
    unzip -o -d $i $i.zip
done

# The following years only have single csv files
# These are too large to process at once, so we use this sed script
# to split it into monthly files.
for y in 2016 2017 2018; do
    awk -v year=$y -v outdir="$y/" -F "-" '
        NR==1 {header=$0}; 
        NF>1 && NR>1 {
            if(! files[$2]) {
                print header >> (outdir year "_" $2 ".csv");
                files[$2] = 1;
            };
            print $0 >> (outdir year "_" $2 ".csv");
        }' $y/Events$y.csv;
    
    rm $y/Events$y.csv;
done
