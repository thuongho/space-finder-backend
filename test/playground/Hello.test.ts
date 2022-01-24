import { handler } from '../../services/SpacesTable/Create';

const event = {
  body: {
    location: 'California'
  }
};

handler(event as any, {} as any);
