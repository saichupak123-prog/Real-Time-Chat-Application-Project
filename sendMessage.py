import json
import boto3
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')

connections_table = dynamodb.Table('Connections')
messages_table = dynamodb.Table('Messages')

client = boto3.client(
    'apigatewaymanagementapi',
    endpoint_url='https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/dev'
)

def lambda_handler(event, context):

    body = json.loads(event['body'])

    sender = body['sender']
    message = body['message']

    # Save message to DynamoDB
    messages_table.put_item(
        Item={
            'messageId': str(uuid.uuid4()),
            'sender': sender,
            'message': message,
            'timestamp': datetime.utcnow().isoformat()
        }
    )

    # Get all active connections
    response = connections_table.scan()

    for item in response['Items']:

        connectionId = item['connectionId']

        try:

            client.post_to_connection(
                ConnectionId=connectionId,
                Data=json.dumps({
                    'sender': sender,
                    'message': message
                })
            )

        except Exception:

            connections_table.delete_item(
                Key={
                    'connectionId': connectionId
                }
            )

    return {
        'statusCode': 200,
        'body': json.dumps('Message Sent')
    }
