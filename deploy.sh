export AWS_PROFILE=transitmatters
export AWS_REGION=us-east-1

pushd server/
chalice package --pkg-format terraform terraform/
pushd terraform/
terraform plan

popd
popd

