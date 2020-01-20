import * as supertest from 'supertest';
import * as http from 'http';

import { Dota2GSIServer } from '../Dota2GSIServer';

const gsi = new Dota2GSIServer('/');
const request = supertest(gsi.server);

describe('GET /', () => {
  it('Method not allowed.', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(405);
  });
});
