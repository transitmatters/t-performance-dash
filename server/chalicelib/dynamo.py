import boto3
from datetime import datetime, timedelta

# Create a DynamoDB resource
dynamodb = boto3.resource('dynamodb')

DATE_FORMAT_BACKEND = "%Y-%m-%d"

AGG_TO_CONFIG_MAP = {
    "daily": {"table_name": "DailySpeed", "delta": 150},
    "weekly": {"table_name": "WeeklySpeed", "delta": 7*150},
    "monthly": {"table_name": "MonthlySpeed", "delta": 30*150},
}

def query_speed_tables(params):
    config = AGG_TO_CONFIG_MAP[params["agg"]]
    table = dynamodb.Table(config["table_name"])

    start_datetime = datetime.strptime(params["start_date"], DATE_FORMAT_BACKEND)
    end_datetime = datetime.strptime(params["end_date"], DATE_FORMAT_BACKEND)
    if start_datetime + timedelta(days=config["delta"]) < end_datetime:
        return {"Error": "Invalid Query - too many items requested."}


    # Define the query parameters
    query_params = {
        'KeyConditionExpression': '#pk = :pk and #date BETWEEN :start_date and :end_date',
        'ExpressionAttributeNames': {
            '#pk': 'line',
            '#date': 'date'
        },
        'ExpressionAttributeValues': {
            ':pk': params["line"],
            ':start_date': params["start_date"],
            ':end_date': params["end_date"]
        }
    }

    # Execute the query and return the results
    response = table.query(**query_params)
    return response['Items']
