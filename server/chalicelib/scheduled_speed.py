import boto3

dyn_resource = boto3.resource("dynamodb")
table = dyn_resource.Table("DailyScheduledSpeed")


def fetch_scheduled_speed(params):
    query_params = {
        'KeyConditionExpression': '#pk = :pk and #date = :date',
        'ExpressionAttributeNames': {
            '#pk': 'line',
            '#date': 'date'
        },
        'ExpressionAttributeValues': {
            ':pk': params["line"],
            ':date': params["date"],
        }
    }
    # Execute the query and return the results
    response = table.query(**query_params)
    return response['Items']
