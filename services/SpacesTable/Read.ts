import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventQueryStringParameters,
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
        result.body = await queryWithPrimaryPartition(
          event.queryStringParameters
        );
      } else {
        result.body = await queryWithSecondaryPartition(
          event.queryStringParameters
        );
      }
    } else {
      result.body = await scanTable();
    }
  } catch (error) {
    result.body = (error as any).message;
  }

  return result;
}

async function queryWithSecondaryPartition(
  queryParams: APIGatewayProxyEventQueryStringParameters
) {
  const queryKey = Object.keys(queryParams)[0];
  const queryValue = queryParams[queryKey];
  const queryResponse = await dbClient
    .query({
      TableName: TABLE_NAME!,
      IndexName: queryKey, // query by this index
      KeyConditionExpression: '#zz = :zzzz',
      ExpressionAttributeNames: {
        '#zz': queryKey
      },
      ExpressionAttributeValues: {
        ':zzzz': queryValue
      }
    })
    .promise();
  return JSON.stringify(queryResponse.Items);
}

async function queryWithPrimaryPartition(
  queryParams: APIGatewayProxyEventQueryStringParameters
) {
  // keyValue is spaceId
  const keyValue = queryParams[PRIMARY_KEY!];
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

  return JSON.stringify(queryResponse);
}

async function scanTable() {
  const queryResponse = await dbClient
    .scan({
      TableName: TABLE_NAME!
    })
    .promise();
  return JSON.stringify(queryResponse);
}

export { handler };
