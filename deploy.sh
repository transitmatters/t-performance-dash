#!/bin/bash
set -e

export AWS_PROFILE=transitmatters
export AWS_REGION=us-east-1
export AWS_PAGER=""

# Setup environment stuff
# By default deploy to production, otherwise "./deploy.sh beta" deploys to beta stage

[[ "$1" = "beta" ]] && ENV_SUFFIX="-beta" || ENV_SUFFIX=""
[[ "$1" = "beta" ]] && CHALICE_STAGE="beta" || CHALICE_STAGE="production"
[[ "$1" = "beta" ]] && BACKEND_CERT_ARN="$TM_BACKEND_CERT_ARN_BETA" || BACKEND_CERT_ARN="$TM_BACKEND_CERT_ARN"

BACKEND_BUCKET=datadashboard-backend$ENV_SUFFIX
FRONTEND_HOSTNAME=dashboard$ENV_SUFFIX.transitmatters.org # Must match in .chalice/config.json!
CF_STACK_NAME=datadashboard$ENV_SUFFIX

echo "Starting $CHALICE_STAGE deployment"
echo "Backend bucket: $BACKEND_BUCKET"
echo "Hostname: $FRONTEND_HOSTNAME"
echo "CloudFormation stack name: $CF_STACK_NAME"

npm run build

pushd server/ > /dev/null
pipenv run chalice package --stage $CHALICE_STAGE --merge-template frontend-cfn.json cfn/
aws cloudformation package --template-file cfn/sam.json --s3-bucket $BACKEND_BUCKET --output-template-file cfn/packaged.yaml
aws cloudformation deploy --template-file cfn/packaged.yaml --stack-name $CF_STACK_NAME --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset --parameter-overrides TMFrontendHostname=$FRONTEND_HOSTNAME TMBackendCertArn=$BACKEND_CERT_ARN
popd > /dev/null
aws s3 sync build/ s3://$FRONTEND_HOSTNAME

# Grab the cloudfront ID and invalidate its cache
CLOUDFRONT_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items!=null] | [?contains(Aliases.Items, '$FRONTEND_HOSTNAME')].Id | [0]" --output text)
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

echo
echo
echo "Complete"
