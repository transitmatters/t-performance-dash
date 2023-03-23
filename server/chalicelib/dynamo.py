import boto3

# Create a DynamoDB resource
dynamodb = boto3.resource('dynamodb')

aggToTable = {
    'daily': "DailySpeed",
    'weekly': "WeeklySpeed",
    'monthly': "MonthlySpeed"
}


def query_speed_tables(params):
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
