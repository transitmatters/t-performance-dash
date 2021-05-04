#!/bin/bash

GIT_COMMIT_ID=`git describe --always --dirty --abbrev=10`

echo "Deploying git commit id $GIT_COMMIT_ID"
sed -i "s/commit-id/$GIT_COMMIT_ID/" ./public/index.html
