import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Connections')

def lambda_handler(event, context):

    connectionId = event['requestContext']['connectionId']

    table.put_item(
        Item={
            'connectionId': connectionId
        }
    )

    return {
        'statusCode': 200,
        'body': 'Connected'
    }
