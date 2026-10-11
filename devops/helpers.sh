#!/bin/bash

# Check the Chalice deployment package fits in Lambda.
# Unlike data-ingestion and mbta-performance, we don't use automatic_layer, so the limit that bites is
# Lambda's 250 MiB unzipped total for function code plus layers, not a zipped layer size.
function check_package_size {
    local zipfile="${1:-cfn/deployment.zip}"
    local maximumsize=262144000
    # The Datadog extension layer in server/.chalice/config.json (v90 unzips to ~14.4 MB). Update on a layer bump.
    local layersize=15000000

    if [ ! -f "$zipfile" ]; then
        echo "Error: $zipfile not found"
        exit 1
    fi

    local zippedsize=$(wc -c <"$zipfile" | tr -d ' ')
    local codesize=$(unzip -l "$zipfile" | tail -1 | awk '{print $1}')
    local actualsize=$(($codesize + $layersize))
    local difference=$(($maximumsize - $actualsize))

    echo "$zipfile is $zippedsize bytes zipped, $codesize bytes unzipped (+$layersize bytes of layers)"

    if [ $actualsize -ge $maximumsize ]; then
        echo ""
        echo "$zipfile is over $maximumsize bytes unzipped with layers. Shrink it by $((-$difference)) bytes to be able to deploy"
        exit 1
    fi

    echo "$zipfile is under the maximum size of $maximumsize bytes, by $difference bytes"
}
