import boto3

bucket = boto3.resource("s3").Bucket("tm-service-ridership-dashboard")


def get_service_ridership_dash_json():
    obj = bucket.Object("latest.json")
    body = obj.get()["Body"].read()
    return body.decode("utf-8")
