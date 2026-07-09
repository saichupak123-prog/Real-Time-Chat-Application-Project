import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Connections')

def lambda_handler(event, context):

    connectionId = event['requestContext']['connectionId']

    table.delete_item(
        Key={
            'connectionId': connectionId
        }
    )

    return {
        'statusCode': 200,
        'body': 'Disconnected'
    }
