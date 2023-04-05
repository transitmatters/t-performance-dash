import boto3
from boto3.dynamodb.conditions import Key

# Create a DynamoDB resource
dynamodb = boto3.resource('dynamodb')


def query_speed_tables(table_name, line, start_date, end_date):
    table = dynamodb.Table(table_name)
    response = table.query(KeyConditionExpression=Key("line").eq(line) & Key("date").between(start_date, end_date))
    return response['Items']
