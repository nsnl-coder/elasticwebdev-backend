const request = require('supertest');
const { app } = require('../../config/app');
const { createMenu } = require('./utils');

let cookie = '';

beforeEach(async () => {
  // create 6 menus
  await createMenu({ test_number: 11, test_string: 'a' });
  await createMenu({ test_number: 12, test_string: 'd' });
  await createMenu({ test_number: 13, test_string: 'c' });
  await createMenu({ test_number: 14, test_string: 'e' });
  await createMenu({ test_number: 15, test_string: 'f' });
  await createMenu({ test_number: 16, test_string: 'b' });
});

it('should return all menus', async () => {
  const response = await request(app)
    .get('/api/menus')
    .set('Cookie', cookie)
    .expect(200);

  expect(response.body.data[0].test_string).toBeDefined();
  expect(response.body.data[0].test_number).toBeDefined();
  expect(response.body.data[0].test_any).toBeDefined();
  expect(response.body.results).toEqual(6);
});

describe('limit fields', () => {
  it('should return menu with only 2 selected fields: test_string and test_any', async () => {
    const { body } = await request(app)
      .get(`/api/menus?fields=test_string,test_any`)
      .set('Cookie', cookie)
      .expect(200);

    expect(body.data[0].test_string).toBeDefined();
    expect(body.data[0].test_any).toBeDefined();
    expect(body.data[0].test_number).toBeUndefined();
  });

  it('should return all fields except for excluded field', async () => {
    const { body } = await request(app)
      .get(`/api/menus?fields=-test_any`)
      .set('Cookie', cookie)
      .expect(200);

    expect(body.data[0].test_string).toBeDefined();
    expect(body.data[0].test_number).toBeDefined();
    expect(body.data[0].test_any).toBeUndefined();
  });
});

describe('itemPerPage & page', () => {
  it('should return 2 menus with ?itemsPerPage=2&page=1', async () => {
    const response = await request(app)
      .get('/api/menus?itemsPerPage=2&page=1')
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body.results).toEqual(2);
    expect(response.body.totalPages).toEqual(3);
  });

  it('should returns single menu with itemsPerPage=2 and page=2', async () => {
    const response = await request(app)
      .get('/api/menus?itemsPerPage=2&page=2')
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body.results).toEqual(2);
    expect(response.body.totalPages).toEqual(3);
  });

  it('should return 200 despite only itemsPerPage provided', async () => {
    const response = await request(app)
      .get('/api/menus?itemsPerPage=3')
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body.results).toEqual(3);
    expect(response.body.totalPages).toEqual(2);
  });

  it('should return 200 even only page is provided', async () => {
    const response = await request(app)
      .get('/api/menus?page=1')
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body.results).toEqual(6);
    expect(response.body.totalPages).toEqual(1);
  });

  it('should return error if page is 0 or negative number', async () => {
    const response = await request(app)
      .get('/api/menus?page=0')
      .set('Cookie', cookie)
      .expect(400);

    expect(response.body.errors).toContain(
      'query.page must be greater than or equal to 1',
    );

    await request(app)
      .get('/api/menus?page=-4')
      .set('Cookie', cookie)
      .expect(400);
  });

  it('should return error if itemsPerPage is 0 or negative number', async () => {
    const response = await request(app)
      .get('/api/menus?itemsPerPage=0')
      .set('Cookie', cookie)
      .expect(400);

    expect(response.body.errors).toContain(
      'query.itemsPerPage must be greater than or equal to 1',
    );

    await request(app)
      .get('/api/menus?itemsPerPage=-4')
      .set('Cookie', cookie)
      .expect(400);
  });
});

describe('sorting', () => {
  it('should sort by number from high to low', async () => {
    const { body } = await request(app)
      .get('/api/menus?sort=-test_number')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.data[0].test_number).toEqual(16);
    expect(body.data[1].test_number).toEqual(15);
    expect(body.data[2].test_number).toEqual(14);
  });

  it('should sort by text from a-z', async () => {
    const { body } = await request(app)
      .get('/api/menus?sort=test_string')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.data[0].test_string).toEqual('a');
    expect(body.data[1].test_string).toEqual('b');
    expect(body.data[2].test_string).toEqual('c');
  });
});

it('should work with combination of query types', async () => {
  const query =
    'fields=test_string,test_number&page=1&itemsPerPage=4&sort=test_number';

  const response = await request(app)
    .get(`/api/menus?${query}`)
    .set('Cookie', cookie)
    .expect(200);

  // check itemsPerPage, page
  expect(response.body.results).toEqual(4);

  // check sort
  expect(response.body.data[0].test_number).toEqual(11);
  expect(response.body.data[1].test_number).toEqual(12);

  // check fields
  expect(response.body.data[0].test_string).toBeDefined();
  expect(response.body.data[0].test_any).toBeUndefined();
});

describe('gt, gte, lt,lte', () => {
  it('return menus that has test_number < 13', async () => {
    const { body } = await request(app)
      .get('/api/menus?test_number[lt]=13')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.results).toEqual(2);
  });

  it('return menus that has test_number <= 13', async () => {
    const { body } = await request(app)
      .get('/api/menus?test_number[lte]=13')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.results).toEqual(3);
  });

  it('return menus that has test_number > 12', async () => {
    const { body } = await request(app)
      .get('/api/menus?test_number[gt]=12')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.results).toEqual(4);
  });

  it('return menus that has test_number >= 12', async () => {
    const { body } = await request(app)
      .get('/api/menus?test_number[gte]=12')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.results).toEqual(5);
  });
});

describe('filter by value', () => {
  it('returns menus has test_number equal to 11 or 14', async () => {
    const { body } = await request(app)
      .get('/api/menus?test_number=11,14&sort=test_number')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.results).toEqual(2);

    expect(body.data[0].test_number).toEqual(11);
    expect(body.data[1].test_number).toEqual(14);
  });

  it('returns menus has test_number equal to 11 or 14 but inputed as hpp polution', async () => {
    const { body } = await request(app)
      .get('/api/menus?test_number=11&sort=test_number&test_number=14')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.results).toEqual(2);

    expect(body.data[0].test_number).toEqual(11);
    expect(body.data[1].test_number).toEqual(14);
  });
});
