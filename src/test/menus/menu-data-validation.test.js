const request = require('supertest');
const { createMenu, validMenuData } = require('./utils');
const { app } = require('../../config/app');

let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  {
    field: 'ordering',
    ordering: 'invalid',
    message: 'wrong data type',
  },
  {
    field: 'ordering',
    ordering: 1000,
    message: 'ordering has max of 999',
  },
];

// ==============================================================
describe.each(invalidData)(
  'invalid $field',
  ({ field, message, ...invalidData }) => {
    it(`shoud fail to create menu because ${message}`, async () => {
      const response = await request(app)
        .post(`/api/menus`)
        .send({
          ...validMenuData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });

    it(`should fail to update menu because ${message}`, async () => {
      const menu = await createMenu();
      const response = await request(app)
        .put(`/api/menus/${menu._id}`)
        .send({
          ...validMenuData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });

    it(`shoud fail to update many menus because ${message}`, async () => {
      let menu1 = await createMenu();
      let menu2 = await createMenu();

      const response = await request(app)
        .put('/api/menus')
        .set('Cookie', cookie)
        .send({
          updateList: [menu1._id, menu2._id],
          ...validMenuData,
          ...invalidData,
        })
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
    });
  },
);
