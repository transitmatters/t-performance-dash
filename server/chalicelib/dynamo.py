import boto3

# Create a DynamoDB resource
dynamodb = boto3.resource('dynamodb')


def update_speed(line, now, value):
    table = dynamodb.Table("OverviewStats")

    try:
        table.update_item(
            Key={"line": line, "stat": "Speed"},
            UpdateExpression='SET #last_updated = :last_updated, #value = :value',
            ExpressionAttributeNames={
                '#last_updated': 'last_updated',
                '#value': 'value',
            },
            ExpressionAttributeValues={
                ':last_updated': f'{now.strftime("%Y-%m-%dT%H:%M:%S")}',
                ':value': value,
            },
        )
    except Exception as e:
        print(e)
        raise


aggToTable = {
    'daily': "LineTraversalTime",
    'weekly': "LineTraversalTimeWeekly",
    'monthly': "LineTraversalTimeMonthly"
}


def query_line_travel_times(params):
    # Get a reference to the LineTraversalTime table
    table = dynamodb.Table(aggToTable[params['agg']])

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
