#!/bin/bash

set -e

export AWS_PROFILE=transitmatters
export AWS_REGION=us-east-1
export AWS_DEFAULT_REGION=us-east-1
export AWS_PAGER=""

PRODUCTION=false
CI=false

# Argument parsing
# pass "-p" flag to deploy to production
# pass "-c" flag if deploying with CI

while getopts "pc" opt; do
    case $opt in
        p)
            PRODUCTION=true
            ;;
        c)
            CI=true
            ;;
  esac
done

# Setup environment stuff
# By default deploy to beta, otherwise deploys to production

$PRODUCTION && ENV_SUFFIX="" || ENV_SUFFIX="-beta"
$PRODUCTION && CHALICE_STAGE="production" || CHALICE_STAGE="beta"
$PRODUCTION && FRONTEND_CERT_ARN="$TM_FRONTEND_CERT_ARN" || FRONTEND_CERT_ARN="$TM_FRONTEND_CERT_ARN_BETA"
$PRODUCTION && BACKEND_CERT_ARN="$TM_BACKEND_CERT_ARN" || BACKEND_CERT_ARN="$TM_BACKEND_CERT_ARN_BETA"

# Fetch repository tags
# Run unshallow if deploying in CI

if $CI; then
    git fetch --unshallow --tags
else
    git fetch --tags
fi

# If production, identify build with latest git tag
# If beta, identify build with dirty hash

if $PRODUCTION; then
    GIT_ID=`git describe --tags --abbrev=0`
    echo "Deploying git tag $GIT_ID to production site"
else
    GIT_ID=`git describe --always --dirty --abbrev=10`
    echo "Deploying git commit id $GIT_ID to beta site"
fi

BACKEND_BUCKET=datadashboard-backend$ENV_SUFFIX
FRONTEND_HOSTNAME=dashboard$ENV_SUFFIX.transitmatters.org # Must match in .chalice/config.json!
CF_STACK_NAME=datadashboard$ENV_SUFFIX

echo "Starting $CHALICE_STAGE deployment"
echo "Backend bucket: $BACKEND_BUCKET"
echo "Hostname: $FRONTEND_HOSTNAME"
echo "CloudFormation stack name: $CF_STACK_NAME"

# build frontend and patch in commit id
npm run build
sed -i "s/git-id/version $GIT_ID/" ./build/index.html

pushd server/ > /dev/null
poetry export --output requirements.txt
poetry run chalice package --stage $CHALICE_STAGE --merge-template frontend-cfn.json cfn/
aws cloudformation package --template-file cfn/sam.json --s3-bucket $BACKEND_BUCKET --output-template-file cfn/packaged.yaml
aws cloudformation deploy --template-file cfn/packaged.yaml --stack-name $CF_STACK_NAME --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset --parameter-overrides \
    TMFrontendHostname=$FRONTEND_HOSTNAME \
    TMFrontendCertArn=$FRONTEND_CERT_ARN \
    TMBackendCertArn=$BACKEND_CERT_ARN \
    MbtaV2ApiKey=$MBTA_V2_API_KEY

popd > /dev/null
aws s3 sync build/ s3://$FRONTEND_HOSTNAME

# Grab the cloudfront ID and invalidate its cache
CLOUDFRONT_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items!=null] | [?contains(Aliases.Items, '$FRONTEND_HOSTNAME')].Id | [0]" --output text)
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

echo
echo
echo "Complete"
