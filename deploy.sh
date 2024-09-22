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

# Ensure required secrets are set
if [[ -z "$MBTA_V3_API_KEY" || -z "$DD_API_KEY"  ]]; then
    echo "Must provide MBTA_V3_API_KEY and DD_API_KEY in environment to deploy" 1>&2
    exit 1
elif [ -z "$TM_FRONTEND_CERT_ARN" ] && [ -z "$TM_LABS_WILDCARD_CERT_ARN" ]; then
    echo "Must provide TM_FRONTEND_CERT_ARN or TM_LABS_WILDCARD_CERT_ARN in environment to deploy" 1>&2
    exit 1
fi

# Setup environment stuff
# By default deploy to beta, otherwise deploys to production

$PRODUCTION && ENV_SUFFIX=""                                    || ENV_SUFFIX="-beta"
$PRODUCTION && CHALICE_STAGE="production"                       || CHALICE_STAGE="beta"

$PRODUCTION && FRONTEND_ZONE="dashboard.transitmatters.org"     || FRONTEND_ZONE="labs.transitmatters.org"
$PRODUCTION && FRONTEND_CERT_ARN="$TM_FRONTEND_CERT_ARN"        || FRONTEND_CERT_ARN="$TM_LABS_WILDCARD_CERT_ARN"
$PRODUCTION && FRONTEND_DOMAIN_PREFIX=""                        || FRONTEND_DOMAIN_PREFIX="dashboard-beta."

BACKEND_ZONE="labs.transitmatters.org"
BACKEND_CERT_ARN="$TM_LABS_WILDCARD_CERT_ARN"
$PRODUCTION && BACKEND_DOMAIN_PREFIX="dashboard-api."           || BACKEND_DOMAIN_PREFIX="dashboard-api-beta."

# Fetch repository tags
# Run unshallow if deploying in CI

if $CI; then
    git fetch --unshallow --tags
else
    git fetch --tags
fi

# Identify the version and commit of the current deploy
GIT_VERSION=`git describe --tags`
GIT_SHA=`git rev-parse HEAD`
echo "Deploying version $GIT_VERSION | $GIT_SHA"

# Adding some datadog tags to get better data
DD_TAGS="git.commit.sha:$GIT_SHA,git.repository_url:github.com/transitmatters/t-performance-dash"

BACKEND_BUCKET=datadashboard-backend$ENV_SUFFIX
FRONTEND_HOSTNAME=$FRONTEND_DOMAIN_PREFIX$FRONTEND_ZONE # Must match in .chalice/config.json!
BACKEND_HOSTNAME=$BACKEND_DOMAIN_PREFIX$BACKEND_ZONE # Must match in .chalice/config.json!
CF_STACK_NAME=datadashboard$ENV_SUFFIX

configurationArray=("$CHALICE_STAGE" "$BACKEND_BUCKET" "$FRONTEND_HOSTNAME" "$CF_STACK_NAME" "$FRONTEND_CERT_ARN" "$BACKEND_CERT_ARN")
for i in ${!configurationArray[@]}; do
    if [ -z "${configurationArray[$i]}" ]; then
        echo "Failed: index [$i] in configuration array is null or empty";
        exit;
    fi
done

echo "Starting $CHALICE_STAGE deployment"
echo "Backend bucket: $BACKEND_BUCKET"
echo "Frontend hostname: $FRONTEND_HOSTNAME"
echo "Backend hostname: $BACKEND_HOSTNAME"
echo "CloudFormation stack name: $CF_STACK_NAME"

# build frontend
npm run build

pushd server/ > /dev/null
poetry export --without-hashes --output requirements.txt
poetry run chalice package --stage $CHALICE_STAGE --merge-template cloudformation.json cfn/
aws cloudformation package --template-file cfn/sam.json --s3-bucket $BACKEND_BUCKET --output-template-file cfn/packaged.yaml
aws cloudformation deploy --template-file cfn/packaged.yaml --s3-bucket $BACKEND_BUCKET --stack-name $CF_STACK_NAME --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset --parameter-overrides \
    TMFrontendHostname=$FRONTEND_HOSTNAME \
    TMFrontendZone=$FRONTEND_ZONE \
    TMFrontendCertArn=$FRONTEND_CERT_ARN \
    TMBackendCertArn=$BACKEND_CERT_ARN \
    TMBackendHostname=$BACKEND_HOSTNAME \
    TMBackendZone=$BACKEND_ZONE \
    MbtaV3ApiKey=$MBTA_V3_API_KEY \
    DDApiKey=$DD_API_KEY \
    GitVersion=$GIT_VERSION \
    DDTags=$DD_TAGS

popd > /dev/null
aws s3 sync out/ s3://$FRONTEND_HOSTNAME

# Band-aid the fact that v3 doesn't have trailing slashes on its path, but v4 does,
#  so we need /THING to be a valid path in addition to the actual /THING/.
aws s3 cp v3_to_v4_slash_trick/trick.html s3://$FRONTEND_HOSTNAME/rapidtransit --no-guess-mime-type --content-type="text/html"
aws s3 cp v3_to_v4_slash_trick/trick.html s3://$FRONTEND_HOSTNAME/bus --no-guess-mime-type --content-type="text/html"
aws s3 cp v3_to_v4_slash_trick/trick.html s3://$FRONTEND_HOSTNAME/slowzones --no-guess-mime-type --content-type="text/html"

# Grab the cloudfront ID and invalidate its cache
CLOUDFRONT_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items!=null] | [?contains(Aliases.Items, '$FRONTEND_HOSTNAME')].Id | [0]" --output text)
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

echo
echo
echo "Complete"
