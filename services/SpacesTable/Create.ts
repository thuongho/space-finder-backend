import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 } from 'uuid';

const dbClient = new DynamoDB.DocumentClient();

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'Hello from DynamoDb'
  };

  // item is object to insert into DynamoDb
  // spaceId from SpaceTable in SpaceStack
  const item =
    typeof event.body === 'object' ? event.body : JSON.parse(event.body);
  item.spaceId = v4();

  try {
    await dbClient
      .put({
        TableName: 'SpaceTable',
        Item: item
      })
      .promise();
  } catch (error) {
    result.body = (error as any).message;
  }

  result.body = JSON.stringify(`Created item with id: ${item.spaceId}`);

  return result;
}

export { handler };
