import boto3
from botocore.exceptions import ClientError


dyn_resource = boto3.resource("dynamodb")
table = dyn_resource.Table("OverviewStats")


def fetch_schedule_adherence(line):
    try:
        response = table.query(
            KeyConditionExpression='line = :line and stat = :stat',
            ExpressionAttributeValues={
                ':line': line,
                ':stat': 'SpeedAdherence'
            }
        )
    except ClientError:
        print("could not read from table.")
        raise
    return response["Items"]
