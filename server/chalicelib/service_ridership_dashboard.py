"""Service ridership dashboard data retrieval from S3."""

import boto3

bucket = boto3.resource("s3").Bucket("tm-service-ridership-dashboard")


def get_service_ridership_dash_json():
    """Fetch the latest service ridership dashboard JSON from S3.

    Returns:
        str: The decoded JSON string from the latest service ridership dashboard file.
    """
    obj = bucket.Object("latest.json")
    body = obj.get()["Body"].read()
    return body.decode("utf-8")
