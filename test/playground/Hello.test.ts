// import { handler } from '../../services/SpacesTable/Create';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../services/SpacesTable/Read';

const event: APIGatewayProxyEvent = {
  queryStringParameters: {
    spaceId: '26297328-0445-4768-b693-575659b2577b'
  }
} as any;

const result = handler(event as any, {} as any).then((apiResult) => {
  const items = JSON.parse(apiResult.body);
  console.log(123); // add this line for breakpoint
});
