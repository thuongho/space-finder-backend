import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;
const dbClient = new DynamoDB.DocumentClient();

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'Hello from DynamoDb'
  };

  try {
    if (event.queryStringParameters) {
      // PRIMARY_KEY may be undefined. ! to let TS know we're sure it exist
      if (PRIMARY_KEY! in event.queryStringParameters) {
        // keyValue is spaceId
        const keyValue = event.queryStringParameters[PRIMARY_KEY!];
        const queryResponse = await dbClient
          .query({
            TableName: TABLE_NAME!,
            // map a key condition with an expression
            KeyConditionExpression: '#zz = :zzzz',
            ExpressionAttributeNames: {
              '#zz': PRIMARY_KEY!
            },
            ExpressionAttributeValues: {
              ':zzzz': keyValue
            }
          })
          .promise();

        result.body = JSON.stringify(queryResponse);
      }
    } else {
      const queryResponse = await dbClient
        .scan({
          TableName: TABLE_NAME!
        })
        .promise();
      result.body = JSON.stringify(queryResponse);
    }
  } catch (error) {
    result.body = (error as any).message;
  }

  return result;
}

export { handler };
